from transformers import T5Tokenizer, T5Config, T5ForConditionalGeneration
import gensim
from gensim.summarization import summarize


my_model = T5ForConditionalGeneration.from_pretrained('t5-small')
tokenizer = T5Tokenizer.from_pretrained('t5-small')


def summarize_textrank(text):
    # TextRank with Gensim
    summary = summarize(text, ratio=0.2)
    print("input", text)
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
