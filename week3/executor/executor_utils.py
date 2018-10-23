import docker
import os
import shutil
import uuid

from docker.errors import APIError
from docker.errors import ContainerError
from docker.errors import ImageNotFound

#get current directory
CURRENT_DIR = os.path.dirname(__file__)
IMAGE_NAME = 'minliang/cs503' #use the image name you created

client = docker.from_env()

#store code in tmp folder
TEMP_BUILD_DIR = "%s/tmp" %CURRENT_DIR
CONTAINER_NAME = "%s:latest" %IMAGE_NAME

SOURCE_FILE_NAMES = {
	"java" : "Example.java",
	"python": "example.py"
}

BINARY_NAMES = {
	"java": "Example",
	"python": "python.py"
}

BUILD_COMMANDS = {
	"java": "javac",
	"python": "python3"
}

EXECUTE_COMMAND = {
	"java": "java",
	"python": "python3"
}

#load docker image to execute code
def load_image():
	try:
		client.image.get(IMAGE_NAME)
		print("image exists locally")
	except ImageNotFound:
		#if we dont have local copy of the image, loading from docker hub
		print("image not found localy, loading from docker hub")
		client.image.pull(IMAGE_NAME)
	except APIError:
		#if we cannot connect to docker, we cannot run the code
		print("Cannot connect to docker")
	return

def make_dir(dir):
	try:
		os.mkdir(dir)
	except OSError:
		print("cannot create directory")
