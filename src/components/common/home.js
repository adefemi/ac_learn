import React from 'react';
import {Link} from 'react-router-dom'
import {updateUserStatus} from "./miscellaneous";
import "../../assets/css/common/home.css";

class Home extends React.Component{
    componentDidMount() {
        window.scrollTo(0, 0);
        updateUserStatus();
    }
    render = () => (
        <div className={'home'}>
            <div className={'home-title'} data-aos="fade-up">
                Welcome to Adefemi Consult Learn.
            </div>
            <div className={'divider-small'} data-aos="fade-up" data-aos-delay="50"/>
            <div className={'home-details'} data-aos="fade-up" data-aos-delay="100">
                <p>AC learn is basically an extension of <a href="adefemiconsult.com">Adefemiconsult</a> aimed at
                ensuring an easy and interactive learning flow. We have developed this platform to serve as an assistance
                    to those of us who seeks knowledge in the trendy areas of INFORMATION TECHNOLOGY, such as, Basic
                    Programming Concepts, Web Development, and lots more, and are interested in getting an instance
                    dispatch of response through professional trainers ready to provide valuable contents along the
                    line in the acquisition process.
                </p>
                <h3>The Idea</h3>
                <p>
                    The idea behind AC learn is the need for learners and upcoming developers to have an instant share
                    of concepts between themselves and corresponding trainers. Thereby allowing for instant feedback to
                    lingering questions.
                </p>
            </div>

            <div className={'get-started-container'} data-aos="zoom-in" data-aos-delay="150" data-aos-duration="500">
                <Link to={'/course'} className={'get-started-button'}>Get Started</Link>
            </div>
        </div>
    )
}

export default Home;

