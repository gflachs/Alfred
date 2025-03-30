import json
import requests
import logging
import threading
# Quelle: https://www.hackster.io/naveenbskumar/fall-detection-system-with-edge-impulse-and-blues-wireless-a4dbba

# Den API-Key findet man in Edge Impulse im Dashboard oben unter Keys.
API_KEY = "ei_e92520a37aa49f4764e10e5f4b90604b2d37e029d1cb2e42598aa2d380c6c463"
# Die ID findet man in Edge Impulse im Dashboard ganz unten rechts im Dashboard.
projectId = "656668"
headers = {
    "Accept": "application/json",
    "x-api-key": API_KEY
}

def get_sample_len(sampleId):
    url = f'https://studio.edgeimpulse.com/v1/api/{projectId}/raw-data/{sampleId}'
    response = requests.request("GET", url, headers=headers)
    resp = json.loads(response.text)
    return resp['sample']['totalLengthMs']

def get_segments(sampleId):
    url = f'https://studio.edgeimpulse.com/v1/api/{projectId}/raw-data/{sampleId}/find-segments'
    payload = {
        "shiftSegments": False,
        # Hier die gewünschte Länge der Segmente in Millisekunden eintragen
        "segmentLengthMs": 2500
    }
    response = requests.request("POST", url, json=payload, headers=headers)
    return json.loads(response.text)["segments"]


def segment(tid, ids):
    for sampleId in ids:
        try:
            segments = get_segments(sampleId)
            if len(segments) > 0:
                payload = {"segments": segments}
                url = f'https://studio.edgeimpulse.com/v1/api/{projectId}/raw-data/{sampleId}/segment'
                response = requests.request("POST", url, json=payload, headers=headers)
                resp = json.loads(response.text)
                if resp['success']:
                    logging.info(f'Segment: {tid} {sampleId}')
                else:
                    logging.error(f'Segment: {tid} {sampleId} {resp["error"]}')
        except Exception as e:
            logging.error(f'Segment: exception {sampleId}')
            continue

def get_id_list():
    # Hier die gewünschten Labels eintragen. Category: training, testing
    # Labels: falling, idle, lyingDown, sittingDown, walking oder andere selbst definierte Labels
    querystring = {"category":"training", "excludeSensors":"true", "labels": '["falling",  "idle", "lyingDown", "sittingDown", "walking"]'}
    url = f'https://studio.edgeimpulse.com/v1/api/{projectId}/raw-data'
    response = requests.request("GET", url, headers=headers, params=querystring)
    resp = json.loads(response.text)
    id_list = list(map(lambda s: s["id"], resp["samples"]))
    return id_list

if __name__ == "__main__":
    format = "%(asctime)s: %(message)s"
    logging.basicConfig(format=format, level=logging.INFO,
    datefmt="%H:%M:%S")
    id_list = get_id_list()
    logging.info('Sample Count: {}'.format(len(id_list)))
    div = 8
    n = int(len(id_list) / div)
    threads = list()
    for i in range(div):
        if i == (div - 1):
            ids = id_list[n*i: ]
        else:
            ids = id_list[n*i: n*(i+1)]
        x = threading.Thread(target=segment, args=(i, ids))
        threads.append(x)
        x.start()
    for thread in threads:
        thread.join()
    logging.info("Finished")