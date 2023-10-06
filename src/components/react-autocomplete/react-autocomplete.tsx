import React, { useState, useEffect, useRef, InputHTMLAttributes } from "react";
import jsonData from "../../data/countries.json"; // Import the JSON file of countries
import useDebounce from "../../hooks/useDebounce";
import "./style.css";

interface AutoCompleteProps extends InputHTMLAttributes<HTMLInputElement> {}

const AutoComplete: React.FC<AutoCompleteProps> = (props) => {
  const { ...inputProps } = props;
  const [inputValue, setInputValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to fetch data based on user input
  const fetchData = async (input: string) => {
    try {
      // Simulate an asynchronous operation using setTimeout
      const filteredData = await new Promise<string[]>(
        (resolve) =>
          setTimeout(() => {
            // Filter the data based on the input
            const filteredItems = jsonData.countries.filter((item) =>
              item.toLowerCase().includes(input.toLowerCase())
            );
            resolve(filteredItems);
          }, 500) // Simulate a 1/2-second delay
      );

      setSuggestions(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Debounce user input to reduce the number of API calls
  const handleChangeText = useDebounce(
    (inputValue: string) => {
      if (inputValue) {
        fetchData(inputValue);
      } else {
        setSuggestions([]);
      }
    },
    200,
    []
  );

  // Reset the component's state
  const handleReset = () => {
    if (highlightedIndex >= 0) {
      setHighlightedIndex(-1);
    }
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (highlightedIndex >= 0) {
      setInputValue(suggestions[highlightedIndex]);
    }
    handleReset();
  };

  // Scroll a suggestion into view when navigating with arrow keys
  const scrollSuggestionIntoView = (index: number) => {
    const suggestionElement = document.querySelector(
      `.suggestions li:nth-child(${index + 1})`
    );
    if (suggestionElement) {
      suggestionElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  // Handle Arrow Up key press
  const handleArrowUp = () => {
    if (highlightedIndex > 0) {
      setHighlightedIndex((prevIndex) => prevIndex - 1);
      scrollSuggestionIntoView(highlightedIndex - 1);
    }
  };

  // Handle Arrow Down key press
  const handleArrowDown = () => {
    if (highlightedIndex < suggestions.length - 1) {
      setHighlightedIndex((prevIndex) => prevIndex + 1);
      scrollSuggestionIntoView(highlightedIndex + 1);
    }
  };

  // Handle keydown event to navigate through suggestions using arrow keys
  const handleKeyDown = (e: Event) => {
    const keyboardEvent = e as KeyboardEvent;
    if (keyboardEvent.key === "ArrowUp") {
      keyboardEvent.preventDefault();
      handleArrowUp();
    } else if (keyboardEvent.key === "ArrowDown") {
      keyboardEvent.preventDefault();
      handleArrowDown();
    }
  };

  // Add a keydown event listener when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Render the AutoComplete component
  return (
    <form className="auto-complete" onSubmit={handleSubmit}>
      <h1>AutoComplete</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleChangeText(e.target.value);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        {...inputProps}
      />
      <ul className={`suggestions ${suggestions.length === 0 ? "hidden" : ""}`}>
        {suggestions.map((item, index) => (
          <li
            key={index}
            className={index === highlightedIndex ? "highlighted" : ""}
            onClick={() => {
              setInputValue(item);
              handleReset();
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </form>
  );
};

export default AutoComplete;
