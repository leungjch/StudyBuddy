import argparse
from enum import Enum
import io

from google.cloud import vision
from PIL import Image, ImageDraw
import json
import base64


def gcp_ocr(image_content):
    client = vision.ImageAnnotatorClient()

    content = base64.b64encode(image_content).decode()

    image = vision.Image(content=content)

    response = client.document_text_detection(image=image)

    document = annotation = response.full_text_annotation

    # print(document.text)

    breaks = vision.TextAnnotation.DetectedBreak.BreakType
    paragraphs = []
    lines = []

    for page in annotation.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                para = ""
                line = ""
                for word in paragraph.words:
                    for symbol in word.symbols:
                        line += symbol.text
                        if symbol.property.detected_break.type_ == breaks.SPACE:
                            line += ' '
                        if symbol.property.detected_break.type_ == breaks.EOL_SURE_SPACE:
                            line += ' '
                            lines.append(line)
                            para += line
                            line = ''
                        if symbol.property.detected_break.type_ == breaks.LINE_BREAK:
                            lines.append(line)
                            para += line
                            line = ''
                paragraphs.append(para)

    print(paragraphs)
    print(lines)
