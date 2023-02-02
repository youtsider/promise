const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

// promise的状态一旦更改就不可再更改
// promise可以链式调用，所以在执行then后返回一个新的promise
// then中返回的普通值会被传到第二个then的成功函数中
// then中抛出错误会走到第二个then的失败函数
// then中返回的是promise，将会根据promise的状态来决定第二个then的执行逻辑

// 用来处理then中返回值各种情况
function resolvePromise(promise2, x, resolve, reject) {
  let called
  // 解决循环应用问题
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }

  // x为对象或者为一个函数就可能是一个promise
  if ((typeof x === 'object' && x != null) || typeof x === 'function') { 
    // 过程中报错则走下一个then的reject
    try {
      let then = x.then; // 返回值上有then并且then为函数，我们就认为返回值x是一个promise
      if (typeof then === 'function') {
        // 根据promise的状态来决定走第二个then的resolve还是reject
        then.call(x, y=> {
         // 避免外部的promise执行过resolve后还能继续改变状态
          if (called) return;
          called = true;
           // 第二个then的返回值还有可能是一个promise，所以递归执行resolvePromise
          resolvePromise(promise2, y, resolve, reject)
        }, r => {
          if (called) return;
          called = true;
          reject(r)
        })
      } else {
        // 普通值直接走resolve
        resolve(x)
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e)
    }
  } else {
     // 普通值直接走resolve
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = []; // 存放成功的回调函数,，promise实例可多次调用then,所以用数组保存
    this.onRejectedCallbacks = [];
    let resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;

        // 依次执行存放的callback
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    let reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;

        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then (onFulfilled, onRejected) {

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => { // 将实例promise2传给resolvePromise时，promise2还是undefined，所以采用异步模式
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
  
      // 当executor函数中是异步函数时，执行then的时候，用户还没有调用resolve，所以需要先存起来
      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        });
  
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        });
      }
    });

    return promise2;
  }
}

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve,reject)=>{
      dfd.resolve = resolve;
      dfd.reject = reject;
  })
  return dfd;
}

module.exports = Promise