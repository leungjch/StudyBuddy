import argparse
from enum import Enum
import io

from google.cloud import vision
from PIL import Image, ImageDraw
import json
import base64

import os
import sys
import numpy as np
import cv2
import time
from imutils.object_detection import non_max_suppression


def gcp_ocr(image_content):
    client = vision.ImageAnnotatorClient()

    content = base64.b64decode(image_content)

    image = vision.Image(content=content)

    response = client.document_text_detection(image=image)

    document = annotation = response.full_text_annotation

    breaks = vision.TextAnnotation.DetectedBreak.BreakType
    paragraphs = []
    lines = []

    for page in annotation.pages:
        # print(page)
        for block in page.blocks:
            for paragraph in block.paragraphs:
                para = ""
                line = ""
                line_bounding_box = {"x": 0, "y": 0, "width": 0, "height": 0}

                for i in range(len(paragraph.words)):
                    word = paragraph.words[i]
                    word_box = word.bounding_box
                    if len(word_box.vertices) != 4:
                        continue
                    # set top left corner if it's the first word of the line
                    # also set height for the line
                    if line == "":
                        line_bounding_box["x"] = word_box.vertices[0].x
                        line_bounding_box["y"] = word_box.vertices[0].y

                    line_bounding_box["height"] = max(line_bounding_box["height"], word_box.vertices[3].y -
                                                      word_box.vertices[0].y)
                    line_bounding_box["width"] += word_box.vertices[1].x - \
                        word_box.vertices[0].x

                    for symbol in word.symbols:
                        line += symbol.text
                        if symbol.property.detected_break.type_ == breaks.SPACE:
                            line += ' '
                        if symbol.property.detected_break.type_ == breaks.EOL_SURE_SPACE:
                            line += ' '
                            print("line", line)
                            lines.append(
                                {"text": line, "bounding_box": line_bounding_box})
                            para += line
                            line = ''
                        if symbol.property.detected_break.type_ == breaks.LINE_BREAK:
                            print("line", line)
                            lines.append(
                                {"text": line, "bounding_box": line_bounding_box})
                            para += line
                            line = ''
                paragraphs.append(para)

    # print(lines)
    return paragraphs, lines


def east_ocr(image):
    # Given the data for an image, returns the list of boxes surrounding text
    layerNames = ["feature_fusion/Conv_7/Sigmoid", "feature_fusion/concat_3"]

    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

    (height, width) = image.shape[:2]

    # Set the new width and height and then determine the ratio in change
    # For both the width and height: Should be multiple of 32
    (newWidth, newHeight) = (320, 320)

    rW = width / float(newWidth)
    rH = height / float(newHeight)

    # resize the image and grab the new image dimensions
    image = cv2.resize(image, (newWidth, newHeight))

    (height, width) = image.shape[:2]

    net = cv2.dnn.readNet("model/frozen_east_text_detection.pb")

    blob = cv2.dnn.blobFromImage(image, 1.0, (width, height),
                                 (123.68, 116.78, 103.94), swapRB=True, crop=False)

    start = time.time()

    net.setInput(blob)

    (scores, geometry) = net.forward(layerNames)

    (numRows, numCols) = scores.shape[2:4]
    rects = []
    confidences = []
    # loop over the number of rows
    for y in range(0, numRows):
        # extract the scores (probabilities), followed by the geometrical
        # data used to derive potential bounding box coordinates that
        # surround text
        scoresData = scores[0, 0, y]
        xData0 = geometry[0, 0, y]
        xData1 = geometry[0, 1, y]
        xData2 = geometry[0, 2, y]
        xData3 = geometry[0, 3, y]
        anglesData = geometry[0, 4, y]

        for x in range(0, numCols):
            # if our score does not have sufficient probability, ignore it
            # Need score of at least 0.5
            if scoresData[x] < 0.5:
                continue

            # compute the offset factor as our resulting feature maps will
            #  x smaller than the input image
            (offsetX, offsetY) = (x * 4.0, y * 4.0)

            # extract the rotation angle for the prediction
            angle = anglesData[x]
            cos = np.cos(angle)
            sin = np.sin(angle)
            # use the geometry volume to derive the width and height of
            # the bounding box
            h = xData0[x] + xData2[x]
            w = xData1[x] + xData3[x]
            # compute both the starting and ending (x, y)-coordinates for
            # the text prediction bounding box
            endX = int(offsetX + (cos * xData1[x]) + (sin * xData2[x]))
            endY = int(offsetY - (sin * xData1[x]) + (cos * xData2[x]))
            startX = int(endX - w)
            startY = int(endY - h)
            # add the bounding box coordinates and probability score to
            # our respective lists
            rects.append((startX, startY, endX, endY))
            confidences.append(scoresData[x])

    boxes = non_max_suppression(np.array(rects), probs=confidences)

    scaled_boxes = np.zeros((len(boxes), 4))

    for i in range(len(boxes)):
        # scale the bounding box coordinates based on the respective ratios
        # Add scaled bounding box to final array

        scaled_boxes[i][0] = int(boxes[i][0] * rW)
        scaled_boxes[i][1] = int(boxes[i][1] * rH)
        scaled_boxes[i][2] = int(boxes[i][2] * rW)
        scaled_boxes[i][3] = int(boxes[i][3] * rH)

    print(time.time() - start)

    return scaled_boxes.astype(np.uintc)


def draw_text_bounding_boxes(image_path, output_path):
    # Get image data
    image = cv2.imread(image_path)

    boxes = east_ocr(image)

    for i in range(len(boxes)):
        cv2.rectangle(image, (boxes[i][0], boxes[i][1]),
                      (boxes[i][2], boxes[i][3]), (0, 255, 0), 2)

    cv2.imwrite(output_pat, image)
