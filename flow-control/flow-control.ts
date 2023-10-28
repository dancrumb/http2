export class FlowControl {
  private credit = 655535;

  addCredit(credit: number) {
    this.credit += credit;
    if (this.credit > 655535) {
      throw new Error("Flow control credit overflow");
    }
  }

  canSend(size: number) {
    return this.credit >= size;
  }
}
