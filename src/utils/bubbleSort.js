function bubbleSort(items) {
  const { length } = items;
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < (length - i - 1); j++) {
      if (items[j] > items[j + 1]) {
        const tmp = items[j];
        items[j] = items[j + 1];
        items[j + 1] = tmp;
      }
    }
  }
}

export default bubbleSort;
