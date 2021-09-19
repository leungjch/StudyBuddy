from dotenv import load_dotenv
import os
import psycopg2
import time
import json
from flask import Flask, request, jsonify, Response, make_response
from flask_cors import CORS, cross_origin

from ocr import gcp_ocr
from ner import ner_spacy
from summarization import summarize_t5, summarize_textrank, summarize_bart

import cv2
import shortuuid

sample = json.load(open("images/processpayload2.json"))

load_dotenv()

COCKROACH_DB_PASS = os.environ['COCKROACH_DB_PASS']


app = Flask(__name__)
cors = CORS(app)


conn = psycopg2.connect(user="htn21",
                        password=COCKROACH_DB_PASS,
                        host="free-tier.gcp-us-central1.cockroachlabs.cloud",
                        port="26257",
                        database="weepy-hyena-3533.defaultdb")


@app.route("/", methods=['GET'])
def root():

    # cur = conn.cursor()
    # cur.execute("SELECT * FROM analytics;")
    # records = cur.fetchall()
    # print(records)

    return {"message": "Welcome to Hack the North 2021!!!"}


@app.route("/test", methods=["get"])
def test():
    response = Response('test')

    @response.call_on_close
    def on_close():
        for i in range(10):
            time.sleep(1)
            print(i)
    return response


@app.route("/new_session", methods=['GET'])
@cross_origin()
def new_session():

    return {"uuid": shortuuid.uuid()}


@app.route("/process", methods=['POST'])
@cross_origin()
def process():
    """
        Payload:
            imageData: base64 image string
    """
    # imageData base64 image string
    # Fetch image data
    data = request.get_json()

    if data is None:
        imageData = sample['imageData']
    else:
        imageData = data.get('imageData')

    # Get OCR text using GCP
    paragraphs, lines = gcp_ocr(imageData)
    full_text = " . ".join(paragraphs)
    # Run Named Entity Recognition
    entities = ner_spacy(full_text)

    # Summarize the text
    summary = summarize_bart(full_text)
    print(lines)
    response = make_response(jsonify(
        {"full_text": full_text, "lines": lines, "entities": entities, "summary": summary}))
    # Write to CockroachDB and write the image to Google blob storage

    @response.call_on_close
    def on_close():
        cur = conn.cursor()
        sql = '''
            INSERT INTO analytics (full_text, summary, entities)
            VALUES (%s, %s, %s);
        '''
        data = (json.dumps(full_text), json.dumps(
            summary), json.dumps(entities))

        cur.execute(sql, data)
        # cur.execute("SELECT * from analytics;")
        # records = cur.fetchall()
        conn.commit()

    return response


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
