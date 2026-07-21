const estimateTokenCount = (text = "") => {
  if (!text) {
    return 0;
  }

  /*
   * A practical estimation:
   * one token is approximately four characters in English/code.
   *
   * Later, this can be replaced with a model-specific tokenizer.
   */
  return Math.ceil(text.length / 4);
};

module.exports = {
  estimateTokenCount,
};