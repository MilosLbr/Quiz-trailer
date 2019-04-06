

let main = document.getElementById('main');


let PlayButton = (props) => {
        const buttonText = props.buttonText;
        const quizStarted = props.quizStarted;

        return !quizStarted? (
            <div className = 'button-container'>
                <button className='play-button' onClick = {props.handleClick}> { buttonText } </button>
            </div>
        ) :
        ( <div className = 'hidden'>
            <button > { buttonText } </button>
        </div>)
}

let MuteButton = (props) => {
    const buttonText = props.muteButtonText;
    return (
        <button className='mute-button' onClick = {props.muteUnmute}>{buttonText}</button>
    )
}

let VolumeBar = (props) => {
    let volume = props.volume;

       return(
           <input value = {volume} title='Volume' type='range' min='0' max='100' step='0.1' onChange = {props.changeVolume}/>
       ) 
}

let Timer = (props) => {
    const currentMin = props.timer.currentMin;
    const currentSec = props.timer.currentSec;

    return (
        <div className='timer'>
            <span className='current-time'>{currentMin}:{currentSec}/</span>
             <span className='duration-time'>02:09 </span>
        </div>
    )
}

let OtherControls = (props) => {
        return (
            <div className='other-controls'>
                <Timer timer = {props.timer}/>

                <VolumeBar changeVolume={props.changeVolume} volume ={props.volume}/>

                <MuteButton muteUnmute= {props.muteUnmute} muteButtonText={props.muteButtonText}/>
            </div>
        )
}

let  ControlBar = (props) => {
        return (
            <div className = 'control-bar'>
                <PlayButton buttonText= {props.buttonText} quizStarted={props.quizStarted} handleClick = {props.handleClick}/>

                <OtherControls changeVolume ={props.changeVolume} timer = {props.timer} muteUnmute = {props.muteUnmute} volume = {props.volume} muteButtonText={props.muteButtonText}/>
            </div> 
        ) 
}

let Answers = (props) =>{
    let answers = props.answers.map((item, index) => {
        return <div key = {index} className ='answer' onClick = {() => props.answerClicked(index)}>{item}</div>
    });

    return (
        <div className='answers'>
            {answers}
        </div>
    )
}

let Question = (props) => {
    let question =  props.question;

        return (
            <div className='question'>
                <h2>{question}</h2>

                <Answers answerClicked = {props.answerClicked} answers = {props.answers}/>
            </div>
        )
}

let FinishedVideoMessage = (props) => {
    const score = props.numberOfCorrectAswers;

    return score <5? 
    <div className='end-message'>Kviz je gotov, tvoj broj poena je {score}! Pitaj učiteljicu...</div> :
    <div className='end-message'>Kviz je gotov, tvoj broj poena je {score}!</div>
}

let RestartQuizButton = (props) => {
    return (
        <div className='restart-button-container'>
            <button className='restart-button'  onClick={() => props.restartState()}>Probaj opet</button>
        </div>
    )
}


class VideoElement extends React.Component{
    constructor(props){
        super(props);
        this.videoRef = React.createRef();
    }

    playVideo(){
        this.videoRef.current.play();
    }

    pauseVideo(){
        this.videoRef.current.pause();
    }

    changeVolume(volume){
        this.videoRef.current.volume = volume;
    }

    muteUnmuteVideo(bool, volume){
        bool?
            this.videoRef.current.volume = 0
        :
            this.videoRef.current.volume = volume; 
    }

    getCurrentVideoTime(){
        let currentTime = this.videoRef.current.currentTime;
        return currentTime;
    }

    didVideoEnd(){
        return this.videoRef.current.ended? true : false;
    }

    render(){
        return (
            <video ref = {this.videoRef} className='video-player' onTimeUpdate= {this.props.updateTime}>
                <source src="/videos/Branio sam Mladu Bosnu - Trailer.mp4"/>
            </video>
        )
    }
}

class App extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            playing: false,
            currentSec : '00',
            currentMin : '00',
            currentTimeInSec : 0,
            muted : false,
            volume : 100,
            quizStarted: false,
            showQuestion: false,
            questions : questions, // in scriptquiz.js
            counter: 0,
            answers: answers,  // in scriptquiz.js
            correctAnswers : [0, 2, 1, 2, 1, 2, 0, 2],
            userAnswers: new Array(0),
            numberOfCorrectAswers: 0,
            videoEnded: false
        }
        
        this.videoElementClassRef = React.createRef();

        this.handleClick= this.handleClick.bind(this);
        this.updateTime = this.updateTime.bind(this);
        this.muteUnmute = this.muteUnmute.bind(this);
        this.changeVolume = this.changeVolume.bind(this);
        this.answerClicked = this.answerClicked.bind(this);
        this.restartState = this.restartState.bind(this);
    }
        // video control methods
    handleClick(){
        !this.state.playing ? 
        (this.videoElementClassRef.current.playVideo(),
        this.setState({playing: true, quizStarted: true}))  : 
        (this.videoElementClassRef.current.pauseVideo(),
        this.setState({playing: false}))
    }

    updateTime(){
        let currentTime = Math.floor(this.videoElementClassRef.current.getCurrentVideoTime());

        let currentMin = Math.floor(currentTime/60)
        let currentSec = Math.floor(currentTime - currentMin *60)

        currentMin < 10 ? currentMin = '0' + currentMin : currentMin;
        currentSec < 10 ? currentSec = '0' + currentSec : currentSec;

        this.setState({
            currentMin : currentMin,
            currentSec: currentSec,
            currentTimeInSec : currentTime,
        });

        this.newQuestion(currentTime);
        
        if( this.videoElementClassRef.current.didVideoEnd()) {this.setState({videoEnded: true})}
    }

    changeVolume(ev){
        
        let newVolume = ev.target.value;
        this.videoElementClassRef.current.changeVolume(newVolume/100);

        this.setState({
            volume : newVolume
        });
        if(this.state.muted && newVolume > 0 ){
            this.setState({muted : false})
        }
    }

    muteUnmute(){
        !this.state.muted ? 
        (this.videoElementClassRef.current.muteUnmuteVideo(true, this.state.volume/100), this.setState({muted: true}))   :
        (this.videoElementClassRef.current.muteUnmuteVideo(false, this.state.volume/100), this.setState({muted: false}))
    }

        // quiz methods
    newQuestion(currentTime){
        let counter = this.state.counter;

        if(currentTime === 8 && counter === 0){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 1, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
        else if (currentTime === 24 && counter === 1){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 2, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
        else if (currentTime === 44 && counter === 2){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 3, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
        else if (currentTime === 55 && counter === 3){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 4, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
        else if (currentTime === 77 && counter === 4){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 5, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
        else if (currentTime === 84 && counter === 5){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 6, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
        else if (currentTime === 92 && counter === 6){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 7, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
        else if (currentTime === 111 && counter === 7){
            console.log(this.state.questions[this.state.counter]);
            this.setState({counter: 8, showQuestion : true});
            this.videoElementClassRef.current.pauseVideo();
        }
    }

    answerClicked(index){
        
        let answersBeforeClick = this.state.userAnswers;
        answersBeforeClick.push(index);

        let answersUpdated = answersBeforeClick;

        this.setState({
            userAnswers: answersUpdated,
            showQuestion: false
        })

        this.checkAnswers();

        this.videoElementClassRef.current.playVideo();
    }

    checkAnswers(){
        let answersSoFar = this.state.userAnswers;
        let correctAnswers = this.state.correctAnswers;
        let numberOfCorrectAswers = 0;

        answersSoFar.map((answer,index) => {
            answer === correctAnswers[index] ? numberOfCorrectAswers+=1 : numberOfCorrectAswers;
        });

        this.setState({ numberOfCorrectAswers : numberOfCorrectAswers});
    }

    restartState(){

        this.setState({
            playing: false,
            currentSec : '00',
            currentMin : '00',
            currentTimeInSec : 0,
            muted : false,
            volume : 100,
            quizStarted: false,
            showQuestion: false,
            questions : questions, // in scriptquiz.js
            counter: 0,
            answers: answers,  // in scriptquiz.js
            correctAnswers : [0, 2, 1, 2, 1, 2, 0, 2],
            userAnswers: new Array(0),
            numberOfCorrectAswers: 0,
            videoEnded: false
        });
    }
    
    render(){
        let questions, counter , answers;
        const buttonText = !this.state.playing ? 'Play' : 'Pause';
        const muteButtonText = !this.state.muted ? 'Mute' : 'Unmute';
        const quizStarted = this.state.quizStarted;
        const videoDidEnd = this.state.videoEnded;

        const timer = {
            'currentMin' : this.state.currentMin,
            'currentSec' : this. state.currentSec
        };

        const numberOfCorrectAswers = this.state.numberOfCorrectAswers;

        if(this.state.showQuestion){
            questions = this.state.questions;
            counter = this.state.counter -1 ;
            answers = this.state.answers;
            window.scrollTo(0, document.body.scrollHeight);
        }
        
        return (
            
            <div className='container-video'>
            <h2 className='video-title'>Branio sam Mladu Bosnu</h2>
            <div className='video-subtitle'>Quiz Trailer</div>

            <VideoElement updateTime = {this.updateTime} ref={this.videoElementClassRef}/>

            <ControlBar quizStarted={quizStarted} buttonText= {buttonText} handleClick = {this.handleClick} timer = {timer}  muteUnmute ={this.muteUnmute} volume = {this.state.volume} changeVolume = {this.changeVolume} muteButtonText = {muteButtonText}/>
            
            {this.state.showQuestion  && <Question question = {questions[counter]} answers = {answers[counter]} answerClicked = {this.answerClicked}/>}

            {!videoDidEnd && <div className='number-of-correct-answers'>Broj tačnih odgovora: {numberOfCorrectAswers}</div>}

            {videoDidEnd && <FinishedVideoMessage numberOfCorrectAswers ={numberOfCorrectAswers} />}

            {videoDidEnd && <RestartQuizButton restartState = {this.restartState} />}

            </div>

        )
    }
}

render(<App/>, main)