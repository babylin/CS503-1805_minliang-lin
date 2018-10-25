import json
from flask import Flask
app = Flask(__name__)

from flask import jsonify #for serialization
from flask import request

import executor_utils as eu

@app.route('/build_and_run', methods=['POST'])
def build_and_run():
	data = request.get.json()

	if 'code' not in data or 'lang' not in data:
		return 'You should provide "code" and "lang"'

	code = data['code']
	lang = data['lang']

	print("executor API got called with code: %s in %s" % (code, lang))

	result = eu.build_and_run(code, lang)
	#convert object to json format
	return jsonify(result)

if __name__ == '__main__':
	#import sys
	#port = int(sys.argv[1])
	# load docker image
	eu.load_image()
	#start to run our program after 
	app.run()
	#app.run(port = port)
		