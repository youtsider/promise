const Promise = require('./promise')
const p1 = new Promise ((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  })
})

let p2 = p1.then((data) => {
  return new Promise((resolve, reject) => {
    resolve(2000)
  })
}, (err) => {
  console.log("失败1", err)
})

let p3 = p2.then((data) => {
  console.log("第二个then成功", data)
}, (err) => {
  console.log("失败2", err)
})