from transformers import T5Tokenizer, T5Config, T5ForConditionalGeneration
from transformers import BartForConditionalGeneration, BartTokenizer, BartConfig

import gensim
from gensim.summarization import summarize


my_model = T5ForConditionalGeneration.from_pretrained('t5-small')
tokenizer = T5Tokenizer.from_pretrained('t5-small')


bart_tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
bart_model = BartForConditionalGeneration.from_pretrained(
    'facebook/bart-large-cnn')


def summarize_textrank(text):
    print("input", text)

    # TextRank with Gensim
    summary = summarize(text, ratio=0.2)
    print("Summary:", summary)
    return summary


def summarize_t5(original_text):
    text = "summarize:" + original_text

    # encoding the input text
    input_ids = tokenizer.encode(text, return_tensors='pt', max_length=512)

    # Generating summary ids
    summary_ids = my_model.generate(input_ids)

    # Decoding the tensor and printing the summary.
    t5_summary = tokenizer.decode(summary_ids[0])
    print(t5_summary)
    return t5_summary


def summarize_bart(original_text):
    # Encoding the inputs and passing them to model.generate()
    inputs = bart_tokenizer.batch_encode_plus(
        [original_text], return_tensors='pt')
    summary_ids = bart_model.generate(inputs['input_ids'], early_stopping=True)

    # Decoding and printing the summary
    bart_summary = bart_tokenizer.decode(
        summary_ids[0], skip_special_tokens=True)
    print("Summary:", bart_summary)
    return bart_summary
