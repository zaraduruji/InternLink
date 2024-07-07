import React, { useEffect, useState } from 'react';

const Stories = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        fetch('/api/stories')
            .then(response => response.json())
            .then(data => setStories(data));
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
