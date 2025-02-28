import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container text-center py-5">
      {/* Header */}
      <nav className="d-flex justify-content-between align-items-center pb-3">
        <h2 className="fw-bold">LiveChatAI</h2>
        <button className="btn btn-dark">Get Started</button>
      </nav>

      {/* Main Content */}
      <div className="row align-items-center">
        <div className="col-md-6 text-md-start text-center">
          <h1 className="fw-bold">AI Chatbot for Customer Support.</h1>
          <p className="text-muted">
            Resolve 70% of customer support queries instantly. Save time for your team and customers with AI-powered answers.
          </p>
          <button className="btn btn-primary px-4">Get Started</button>
        </div>
        <div className="col-md-6 d-flex justify-content-center">
          <div className="border rounded p-3 shadow" style={{ width: "300px" }}>
            <div className="d-flex align-items-center mb-3">
              <Image src="/chatbot-icon.png" alt="Chatbot" width={40} height={40} />
              <strong className="ms-2">LiveChatAI</strong>
            </div>
            <p className="bg-light p-3 rounded">
              Hey there! 👋 Let’s discuss how to enhance your customer support with LiveChatAI’s AI chatbot.
            </p>
            <input type="text" className="form-control" placeholder="Send message" />
          </div>
        </div>
      </div>
    </div>
  );
}
