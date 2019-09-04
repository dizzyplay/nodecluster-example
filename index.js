import express from "express"
import cluster from "cluster"


if (cluster.isMaster) {
  console.log('d')
  const worker = cluster.fork()
  const server = express()
  server.use((req, res, next) => {
    req.workerObj = {worker}
    next()
  })
  server.get('/', (req, res) => {
    console.log(req.test)
    const a = {value: 'this is value'}
    worker.send({message: 'test', a})
    res.send({message: 'ok'})
  })
  server.listen(3000, () => {
    console.log('server running')
  })

  cluster.on('online', (worker) => {
    console.log(worker.id)
  });
  worker.on('message', (message) => {
    console.log(message)
  })
  cluster.on('exit', (worker, code, signal) => {
    console.log(worker.process.pid + "died")
  })
}

if (cluster.isWorker) {
  process.on('message', (workerObj) => {
    console.log(workerObj)
  })
  setTimeout(() => {
    const server = express()
    server.listen("3001", () => {
      console.log('server 3001')
    })
    process.send(process.pid + ' hello master')
  }, 3000)
}

