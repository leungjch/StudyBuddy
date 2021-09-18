import spacy

spacy.prefer_gpu()
nlp = spacy.load("en_core_web_sm")


def ner_gcp(text):

    return None


def ner_spacy(text):
    print("text is", text)
    doc = nlp(text)

    # Analyze syntax
    print("Noun phrases:", [chunk.text for chunk in doc.noun_chunks])
    print("Verbs:", [token.lemma_ for token in doc if token.pos_ == "VERB"])

    # Find named entities, phrases and concepts
    for entity in doc.ents:
        print(entity.text, entity.label_)
    entities = [{"entity": x.text, "label": x.label_} for x in doc.ents]
    entities = list(
        {item['entity']: item for item in entities}.values())  # uniqueify

    return entities
