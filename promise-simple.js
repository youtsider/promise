const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

// promise的状态一旦更改就不可再更改

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolveCallbacks = []; // 存放成功的回调函数,，promise实例可多次调用then,所以用数组保存
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;

        // 依次执行存放的callback
        this.onResolveCallbacks.forEach(fn => fn())
      }
    }
    const reject = (reason) => {
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

  then (onResolve, onReject) {
    if (this.status === FULFILLED) {
      onResolve(this.value);
    }
    if (this.status === REJECTED) {
      onReject(this.reason)
    }

    // 当executor函数中是异步函数时，执行then的时候，用户还没有调用resolve，所以需要先存起来
    if (this.status = PENDING) {
      this.onResolveCallbacks.push(() => onResolve(this.value));

      this.onRejectedCallbacks.push(() => onReject(this.reason))
    }
  }
}

module.exports = Promise