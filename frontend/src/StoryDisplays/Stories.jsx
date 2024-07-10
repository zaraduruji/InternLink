import React, { useEffect, useState } from 'react';
import './Stories.css';

const Stories = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/stories')
            .then(response => response.json())
            .then(data => setStories(data))
            .catch(error => console.error('Error fetching stories:', error));
    }, []);

    return (
        <div className="stories-container">
            {stories.map(story => (
                <div key={story.id} className="story-circle">
                    <img src={story.fileUrl} alt="Story" className="story-image" />
                </div>
            ))}
        </div>
    );
};

export default Stories;
