import { useState } from "react";

interface Props {
  items: { name: string; price: number }[];
  heading: string;
  onSelectItem: (item: string) => void;
}

function ListGroup({ items, heading, onSelectItem }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  var message = items.length === 0 ? <p>No item found</p> : null;

  return (
    <>
      <h1>{heading}</h1>
      {message}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={item.name}
            onClick={() => {
              setSelectedIndex(index);
              onSelectItem(item.name);
            }}
          >
            {item.name} ${item.price}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
