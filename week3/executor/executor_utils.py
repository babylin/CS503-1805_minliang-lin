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

EXECUTE_COMMANDS = {
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

def build_and_run(code, lang):
	#the result we want
	result = {'build': None, 'run':None, 'error':None}
	#use the uuid to create unique file name
	source_file_parent_dir_name = uuid.uuid4()
	#shared folder that can be used in docker
	source_file_host_dir = "%s/%s" % (TEMP_BUILD_DIR, source_file_parent_dir_name)
	
	source_file_guest_dir = "/test/%s" % (source_file_parent_dir_name)

	make_dir(source_file_host_dir)

	#open source file with selected language and write code into file
	with open("%s/%s" % (source_file_host_dir,SOURCE_FILE_NAMES[lang]), 'w') as source_file:
		source_file.write(code)

	#build code
	try:
		client.containers.run(
			image = IMAGE_NAME,
			#run command to build the code
			command = "%s %s" %(BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
			#bind the host dir and guest dir, 'rw': read and write
			#means we have read and write permission of guest dir
			#docker can access the host dir
			volumes = {source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
			working_dir =source_file_guest_dir
			)
		#seccessfully build the source code
		print("source code built")
		result ['build'] = 'ok'

	except ContainerError as e:
		#fail to build, get the erro message from container
		result['build'] = str(e.stderr, 'utf-8')
		#remove host dir
		shutil.rmtree(source_file_host_dir)
		return result

	#run code if it is build successfully
	try:
		log = client.containers.run(
			image = IMAGE_NAME,
			#run command to build the code
			command = "%s %s" %(EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
			#bind the host dir and guest dir, 'rw': read and write
			#means we have read and write permission of guest dir
			#docker can access the host dir
			volumes = {source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
			working_dir =source_file_guest_dir
		)
		log = str(log, 'utf-8')

		print(log)
		result['run'] = log

	except ContainerError as e:
		#fail to run, get the erro message from container
		result['run'] = str(e.stderr, 'utf-8')
		#remove host dir
		shutil.rmtree(source_file_host_dir)
		return result


	#after build and run clean dir
	shutil.rmtree(source_file_host_dir)
	return result