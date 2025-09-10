import { useState } from "react";

export default function DateForm() {
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Selected Date: ${date}`);
  };

  return (
    <div className="w-1/4 h-10">
      <form
        onSubmit={handleSubmit}
      >
        

        
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        
      </form>
    </div>
  );
}
