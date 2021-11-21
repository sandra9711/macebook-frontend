import React, { Component } from "react";
import { Helmet } from "react-helmet";
import Tweetbox from "./TweetBox/Tweetbox";
import "./Home.scss";
import Card from "../../components/Card/Card";
import Post from "../../components/Post/Post";
import Suggestions from "../../components/Suggestions/Suggestions";
import Header from "../../components/Header/Header";
import postImg from "../../assets/images/icons/postImg.png";
import profilepic from "../../assets/images/icons/UserProfile.png";
import AuthContext from "../../auth/AuthContext";
import isAuthenticated from "../../auth/isAuthenticated";
import Spinner from "../../components/Spinner/Spinner";

class Home extends Component {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            postImg: postImg,
            designation: "SDE I at Amazon",
            profilepic: profilepic,
            posts: [],
            profile: [],
        };

        this.getPosts = this.getPosts.bind(this);
    }

    async getPosts() {
        const { state } = this.context;
        try {
            const token = state.token;
            let response = await fetch("https://mace-connect.herokuapp.com/api/v1/posts", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status != 200) {
                return alert("Couldn't fetch posts! Reload this page.");
            }
            let data = await response.json();

            return this.setState({
                posts: data,
                profile: state.user,
            });
        } catch (error) {
            console.error(error);
        }
    }

    //ABcd@12345678910
    componentDidMount() {
        const { state, dispatch } = this.context;
        if (!state.isAuthenticated) {
            (async () => {
                const [authenticated, payload] = await isAuthenticated();
                if (authenticated === true) {
                    dispatch({
                        type: "LOGIN",
                        payload: payload,
                    });
                    this.getPosts().then(this.setState({ loading: false }));
                } else {
                    this.props.history.push("/login");
                }
            })();
        } else {
            this.getPosts().then(this.setState({ loading: false }));
        }
    }

    render() {
        return (
            <div className="Home">
                <Helmet>
                    <title>Macebook | Home</title>
                </Helmet>

                <Header active={"home"} />

                {this.state.loading ? (
                    <Spinner />
                ) : (
                    <div className="container">
                        <div className="card-cols">
                            <div className="card-col1">
                                <div className="tweetbox-container">
                                    <Tweetbox></Tweetbox>
                                </div>

                                {this.state.posts.map((post) => {
                                    return (
                                        <Card key={post.post_id}>
                                            <Post
                                                poster={this.state.profile.username}
                                                posterprofile={this.state.profilepic}
                                                designation={this.state.designation}
                                                content={post.text}
                                                hashtags={post.hashtags}
                                                image="https://picsum.photos/seed/picsum/200/"
                                                likes={post.likes}
                                                comments={post.comments}
                                                profilepic={this.state.profilepic}
                                            ></Post>
                                        </Card>
                                    );
                                })}
                            </div>
                            <div className="card-col2">
                                <Card>
                                    <Suggestions></Suggestions>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Home;
