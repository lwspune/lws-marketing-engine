# Speak lines with Indic Parler-TTS (AI4Bharat, Apache 2.0): Indian English voices, offline after the first download.
# Called by tools/voice.ts for a "parler-<speaker>" voice; not run by hand:
#   .parler/Scripts/python tools/parler.py <job.json>
# job.json = {"description": "...", "out": "<dir>", "lines": [{"key": "...", "text": "...", "words": "...", "takes": 1}]}
# Writes <out>/<key>.wav per line: mono, 48 kHz (the mix's rate), 16-bit (what sfx.ts readWav takes). Each take's seed
# comes from its key, so the same line always sounds the same. With "takes" > 1 (Parler sometimes mumbles on after a short
# line), each take is heard by an English speech recogniser (wav2vec2, offline) and the one closest to "words" (the line
# as spoken, from voice.ts spokenWords) is kept, the shorter on a tie. The model is gated: accept its terms on huggingface.co and run
# `.parler/Scripts/hf auth login` once (setup: tools/parler-requirements.txt).
import json
import sys
import zlib
from math import gcd

import soundfile as sf
import torch
from parler_tts import ParlerTTSForConditionalGeneration
from scipy.signal import resample_poly
from transformers import AutoTokenizer, Wav2Vec2ForCTC, Wav2Vec2Processor

MODEL, ASR, SR = "ai4bharat/indic-parler-tts", "facebook/wav2vec2-base-960h", 48000

job = json.load(open(sys.argv[1], encoding="utf-8"))
model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL)
tokenizer = AutoTokenizer.from_pretrained(MODEL)
describe = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
d = describe(job["description"], return_tensors="pt")
rate = model.config.sampling_rate
g, g16 = gcd(SR, rate), gcd(16000, rate)
asr = None


def say(text, seed):
    torch.manual_seed(seed)
    p = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        audio = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask,
                               prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
    return audio.cpu().numpy().reshape(-1).astype("float64")


def heard(x):
    global asr
    if asr is None:
        asr = (Wav2Vec2Processor.from_pretrained(ASR), Wav2Vec2ForCTC.from_pretrained(ASR))
    proc, net = asr
    inputs = proc(resample_poly(x, 16000 // g16, rate // g16), sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        ids = net(inputs.input_values).logits.argmax(-1)
    return proc.batch_decode(ids)[0].lower()


def distance(a, b):
    row = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev, row[0] = row[0], i
        for j, cb in enumerate(b, 1):
            prev, row[j] = row[j], min(row[j] + 1, row[j - 1] + 1, prev + (ca != cb))
    return row[-1]


for line in job["lines"]:
    seed, takes = zlib.crc32(line["key"].encode()), line.get("takes", 1)
    best, note = None, ""
    for k in range(takes):
        x = say(line["text"], seed + k)
        if len(x) < rate // 10 and takes > 1:   # Parler now and then returns an empty take (seen 2026-10-27)
            print(f"  take {k + 1}: empty", flush=True)
            continue
        if takes == 1:
            best = x
            break
        h = heard(x)
        score = (distance(h, line["words"]) / max(1, len(line["words"])), len(x))
        print(f"  take {k + 1}: {len(x) / rate:.2f} s, heard \"{h}\" ({score[0]:.0%} off)", flush=True)
        if best is None or score < best_score:
            best, best_score, note = x, score, f" (take {k + 1} of {takes}, heard \"{h}\")"
    if best is None:
        raise RuntimeError(f"every take of \"{line['text']}\" came out empty")
    sf.write(f"{job['out']}/{line['key']}.wav", resample_poly(best, SR // g, rate // g).clip(-1, 1), SR, subtype="PCM_16")
    print(f"{line['key']}: {len(best) / rate:.2f} s  {line['text']}{note}", flush=True)
