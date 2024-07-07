import React, { useEffect, useState } from 'react';

const Stories = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/stories')
            .then(response => response.json())
            .then(data => setStories(data))
            .catch(error => console.error('Error fetching stories:', error));
    }, []);

    return (
        <div className="stories">
            {stories.map(story => (
                <div key={story.id} className="story">
                    <img src={story.fileUrl} alt="Story" />
                </div>
            ))}
        </div>
    );
};

export default Stories;
