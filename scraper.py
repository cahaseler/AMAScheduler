import praw
from psaw import PushshiftAPI
from datetime import datetime
import requests
import time
import csv

SUBREDDIT = "iama"
CLIENT_ID = '****'
CLIENT_SECRET = '****'
USER_AGENT = 'praw:iama_datacollector:1.1 (by /u/cahaseler)'

reddit = praw.Reddit(client_id=CLIENT_ID,
                     client_secret=CLIENT_SECRET,
                     user_agent=USER_AGENT)
api = PushshiftAPI(reddit)

url = "https://api.pushshift.io/reddit/submission/search?limit=1000&sort=desc&subreddit="+SUBREDDIT+"&before="

start_time = datetime.utcnow()

count = 0
totalpulled = 0
writer = csv.writer(open("result.csv", "w", newline='', encoding='utf-8'))
previous_epoch = int(start_time.timestamp())
result = []
while True:
    new_url = url+str(previous_epoch)
    json = requests.get(
        new_url, headers={'User-Agent': USER_AGENT})
    json_data = json.json()
    if 'data' not in json_data:
        break
    objects = json_data['data']
    print(datetime.fromtimestamp(previous_epoch))
    if len(objects) == 0:
        break
    totalpulled += len(objects)
    if count > 20000:
        break
    ids = []
    for object in objects:
        previous_epoch = object['created_utc'] - 1
        if('selftext' in object):
            if(object['selftext'] != '[removed]' and object['selftext'] != '[deleted]' and object['selftext'] != ""):
                ids.append(object['id'])
    ids2 = [i if i.startswith('t3_') else f't3_{i}' for i in ids]
    for post in reddit.info(ids2):
        if(post.selftext != '[removed]' post.selftext != '[deleted]'):
            writer.writerow([post.title, post.selftext, post.link_flair_text, post.score, post.upvote_ratio, post.num_comments,
                             datetime.fromtimestamp(post.created_utc).isoformat()])
            count += 1
            print(count)

print(totalpulled)
