// src/components/UserInputForm.js
import { useState } from 'react';
import { jsPDF } from 'jspdf';

const UserInputForm = () => {
  const [formData, setFormData] = useState({
    website_url: '',
    website_name: '',
    website_purpose: '',
    website_category: '',
    target_audience: ''
  });
  const [result, setResult] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResult(formatResult(data.generated_text));
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred.');
    }
  };

  const formatResult = (text) => {
    // Remove unwanted characters and format the result
    return text
      .replace(/#/g, '')  // Remove any # characters
      .replace(/(?:\r\n|\r|\n)/g, '<br />')  // Replace new lines with <br> for HTML rendering
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **bold** to <strong>
      .replace(/__(.*?)__/g, '<em>$1</em>');  // Convert __italic__ to <em>
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica', 'normal');

    // Add title
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('SEO Strategy Generator Results', 10, 15);

    // Add result content
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');

    const margin = 15; // Margin from the left edge
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 4.2; // Adjusted line height
    let y = 22; // Starting y position for text

    // Split result by lines
    const lines = result.split('<br />');

    lines.forEach(line => {
      // Handle bold and italic text
      if (line.includes('<strong>')) {
        doc.setFont('Helvetica', 'bold');
        line = line.replace(/<strong>/g, '').replace(/<\/strong>/g, '');
      } else if (line.includes('<em>')) {
        doc.setFont('Helvetica', 'italic');
        line = line.replace(/<em>/g, '').replace(/<\/em>/g, '');
      } else {
        doc.setFont('Helvetica', 'normal');
      }

      // Wrap text and add to PDF
      const textLines = doc.splitTextToSize(line, pageWidth - 2 * margin);

      textLines.forEach(textLine => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = 15; // Reset y to top of new page
        }
        doc.text(textLine, margin, y);
        y += lineHeight;
      });

      // Add space between lines
      y += 1; // Reduced space between lines
    });

    doc.save('seo_results.pdf');
  };

  return (
    <>
      <header>
        <h1>SEO Strategy Generator</h1>
      </header>
      <div className="container">
        <div className="form-container">
          <h2>Enter Website Details</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="website_url">Website URL:</label>
            <input type="text" id="website_url" name="website_url" value={formData.website_url} onChange={handleChange} required />

            <label htmlFor="website_name">Website Name:</label>
            <input type="text" id="website_name" name="website_name" value={formData.website_name} onChange={handleChange} required />

            <label htmlFor="website_purpose">Website Purpose:</label>
            <input type="text" id="website_purpose" name="website_purpose" value={formData.website_purpose} onChange={handleChange} required />

            <label htmlFor="website_category">Website Category:</label>
            <input type="text" id="website_category" name="website_category" value={formData.website_category} onChange={handleChange} required />

            <label htmlFor="target_audience">Target Audience:</label>
            <input type="text" id="target_audience" name="target_audience" value={formData.target_audience} onChange={handleChange} required />

            <button type="submit">Generate</button>
          </form>
        </div>
        <div className="result-container">
          <h2>Results:</h2>
          <div className="result-content" dangerouslySetInnerHTML={{ __html: result }} />
        </div>
      </div>
      <button className="pdf-button" onClick={handleDownloadPDF}>Download as PDF</button>
    </>
  );
};

export default UserInputForm;
