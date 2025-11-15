export default function Footer() {
  const students = [
    { name: "Honey Arora", url: "https://www.linkedin.com/in/honey-arora-288783273/" },
    { name: "Yash Patel", url: "https://www.linkedin.com/in/yash-patel-34a890365/" },
    { name: "Shubham Patel", url: "https://www.linkedin.com/in/shubham-patel-506a79270/" },
  ];

  const quote =
    "Built to protect people from legal document scams — in service of human welfare, dignity, and justice.";

  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <div>
        &copy; {new Date().getFullYear()} Nyayika AI. All rights reserved.
      </div>
      <div className="mt-2 text-sm italic text-gray-300">{quote}</div>
      <div className="mt-3 flex justify-center space-x-4">
        {students.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:underline"
            aria-label={`LinkedIn profile of ${s.name}`}
          >
            {s.name}
          </a>
        ))}
      </div>
    </footer>
  );
}
