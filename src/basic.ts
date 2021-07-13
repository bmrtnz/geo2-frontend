declare global {
  interface String {
    ucFirst(): string;
  }
}

String.prototype.ucFirst = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

export {};
