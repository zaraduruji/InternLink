import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Congratulations.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import confetti from 'canvas-confetti';

const Congratulations = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('congratulations-body');
        confetti({
            particleCount: 150,
            spread: 60
        });

        return () => {
            document.body.classList.remove('congratulations-body');
        };
    }, []);

    return (
        <div className="congratulations-container">
            <h1>You did it! You're now part of InternLink. 🎉</h1>
            <p>Explore, connect, and grow your professional journey with us.</p>
            <p>Stay in the loop! Follow us on Instagram and Facebook by clicking the icons below. 📱</p>
            <div className="social-icons">
                <a href="https://www.instagram.com/intern_link/?hl=en" className="icon instagram" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61562890633102" className="icon facebook" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faFacebook} />
                </a>
            </div>
            <button className="home-button" onClick={() => navigate('/home')}>Go to Home</button>
        </div>
    );
}

export default Congratulations;
