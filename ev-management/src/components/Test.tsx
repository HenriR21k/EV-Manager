function Test() {
  class Person {
    private name: string;
    constructor(name: string) {
      this.name = name;
    }
    printName(): string {
      return this.name;
    }
  }
  let person = new Person("Bob");

  const items = [
    { name: "Bike", price: 100 },
    { name: "TV", price: 200 },
  ];
  const filteredItems = items.filter((item) => {
    return item.price <= 100;
  });
  const foundItem = items.find((item) => {
    return item.name === "TV";
  });
  const hasInexpensiveItems = items.some((item) => {
    return item.price <= 200;
  });
  const hasInexpensiveItems2 = items.every((item) => {
    return item.price <= 200;
  });
  const total = items.reduce((currentTotal, item) => {
    return item.price + currentTotal;
  }, 0);

  const nums = [1, 2, 3, 4];
  const includes = nums.includes(2);
  return (
    <>
      <div>
        <h1>Filter Test</h1>
        {filteredItems.map((item, index) => (
          <p key={index}>
            {item.name} - ${item.price}
          </p>
        ))}
      </div>
      <div>
        <h1>Found Test</h1>
        {foundItem ? (
          <p>
            {foundItem.name} - ${foundItem.price}
          </p>
        ) : (
          <p>None found</p>
        )}
      </div>
      <div>
        <h1>HasInexpensiveItems Test</h1>
        {hasInexpensiveItems ? <p>True</p> : <p>None found</p>}
      </div>
      <div>
        <h1>HasInexpensiveItems Test2</h1>
        {hasInexpensiveItems2 ? <p>True</p> : <p>None found</p>}
      </div>
      <div>
        <h1>Total Test</h1>
        {total ? <p>${total}</p> : <p>None found</p>}
      </div>
      <div>
        <h1>Includes Test</h1>
        {includes ? <p>True</p> : <p>None found</p>}
      </div>
      <div>
        <h1>Includes Test</h1>
        <p>{person.printName()}</p>
      </div>
    </>
  );
}

export default Test;
