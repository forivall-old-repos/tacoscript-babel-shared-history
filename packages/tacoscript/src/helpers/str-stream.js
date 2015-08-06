// not a real stream, only two functions are write() and contents()
// TODO: make this a real stream, at least for node.
// TODO: move to module, so it can be browserified appropriately

export default class StringStream {
  constructor() {
    this.buf = "";
  }
  write(str) {
    this.buf += str;
  }
}
