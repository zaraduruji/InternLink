import React, { useState } from 'react';

const StoryUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('story', selectedFile);
        formData.append('userId', 1);

        try {
            const response = await fetch('http://localhost:3000/api/uploadStory', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Story uploaded successfully!');
            } else {
                alert('Failed to upload story.');
            }
        } catch (error) {
            console.error('Error uploading story:', error);
            alert('An error occurred while uploading the story.');
        }
    };

    return (
        <div className="story-upload">
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload Story</button>
        </div>
    );
};

export default StoryUpload;
