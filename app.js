const http = require('http')

http.createServer((req, res) => {
	res.write('On my way to become the best in the world!')
	res.end()
}).listen(3000, () => {
	console.log('Server started and is running on PORT 3000.')
})
