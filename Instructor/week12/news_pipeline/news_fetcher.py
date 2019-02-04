import logging
import os
import sys

from newspaper import Article

# import common package in parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))

from cloudAMQP_client import CloudAMQPClient

DEDUPE_NEWS_TASK_QUEUE_URL = "amqp://mwvwrzry:lBKgld3kQEotD5fn9am-EjbbwqZeYxIS@hyena.rmq.cloudamqp.com/mwvwrzry"
DEDUPE_NEWS_TASK_QUEUE_NAME = "tap-news-dedupe-news-task-queue"
SCRAPE_NEWS_TASK_QUEUE_URL = "amqp://adsitvpp:z_DpAoLr2R2o-y3Lp-kXTgUBu5dIXAJH@hyena.rmq.cloudamqp.com/adsitvpp"
SCRAPE_NEWS_TASK_QUEUE_NAME = "tap-news-scrape-news-task-queue"

SLEEP_TIME_IN_SECONDS = 5

logger_format = '%(asctime)s - %(message)s'
logging.basicConfig(format=logger_format)
logger = logging.getLogger('news_fetcher')
logger.setLevel(logging.DEBUG)

dedupe_news_queue_client = CloudAMQPClient(DEDUPE_NEWS_TASK_QUEUE_URL, DEDUPE_NEWS_TASK_QUEUE_NAME)
scrape_news_queue_client = CloudAMQPClient(SCRAPE_NEWS_TASK_QUEUE_URL, SCRAPE_NEWS_TASK_QUEUE_NAME)


def handle_message(msg):
	article = Article(msg['url'])
	article.download()
	article.parse()

	msg['text'] = article.text
	dedupe_news_queue_client.sendMessage(msg)


def run():
	while True:
		if scrape_news_queue_client is not None:
			msg = scrape_news_queue_client.getMessage()
			if msg is not None:
				try:
					handle_message(msg)
				except Exception as e:
					logger.warning(e)
					pass
			dedupe_news_queue_client.sleep(SLEEP_TIME_IN_SECONDS)


if __name__ == "__main__":
	run()