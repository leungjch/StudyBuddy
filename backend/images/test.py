import base64
import json
import pyperclip

with open("resonance_structures.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read())

base64_string = encoded_string.decode("utf-8")

pyperclip.copy(base64_string)
print(json.dumps({"imageData": base64_string}))
