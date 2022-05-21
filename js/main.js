(() => {
    
    let yOffset = 0; //window.pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0; //현재 스크롤 위치 보다 이전에 위치한 스크롤 섹션들의 스크롤 높이의 합
    let currentScene = 0; //현재 활성화 된 씬 (scroll-section)
    let enterNewScene = false; //새로운 scene이 시작된 순간 true
    let windowsize = 0;
    let gamestate = 'before_play'   //beforeplay, touching, sliding, end
    let slidingYoffset = 0;

    const sceneInfo = [
        {
            //0
            type: 'beach',
            heightNum: 0.15, 
            scrollHeight: 0
            // objs: {
            // },
            // values: {
            // }
        },
        {
            //1
            type: 'floor',
            heightNum: 1, 
            scrollHeight: 0
            // objs: {
            // },
            // values: {
            // }
        },
        {
            //2
            type: 'floor',
            heightNum: 4.15, 
            scrollHeight: 0,
            objs: {
                canvas: document.querySelector('.shark'),
                context: document.querySelector('.shark').getContext('2d'),
                imagesPath: [
                    `./images/shark/shark_underthesea.png`,
                    `./images/slider/slider.png`
                ],
                videoImages: [],
                images: []
            },
            values: {
                videoImageCount: 25,
                imageSequence: [0,24,{start: 0.7, end: 0.905}],
                canvasSize_jump: [10,50,{start: 0.7, end: 0.905}]
            }
        },
        {
            //3
            type: 'droparea',
            heightNum: 1, 
            scrollHeight: 0
        }  
    ];

    function setCanvasImages(){
        let imgElem;
        for(let i=0; i < sceneInfo[2].values.videoImageCount; i++){
            imgElem = new Image();  
            imgElem.src = `./images/shark/shark_${i}.png`;
            // imgElem.src = `./images/shark_0.JPG`;
            sceneInfo[2].objs.videoImages.push(imgElem);
        }
        let imgElem2;
        for (let i = 0; i< sceneInfo[2].objs.imagesPath.length; i++){
            imgElem2 = new Image();  
            imgElem2.src = sceneInfo[2].objs.imagesPath[i];
            sceneInfo[2].objs.images.push(imgElem2);
        }
        
    }
    setCanvasImages();


    function setLayout() {
        //각 스크룔 섹션의 높이 세팅
        // windowsize = window.innerHeight;
        // windowsize = document.documentElement.clientHeight;
        // 모바일 브라우저 url 바 인식 문제로 1vh의 픽셀을 구해서 적용 (vh는 url바 고려하지 않은 전체 사이즈)
        slider_height = document.querySelector('.slider').clientHeight;
        windowsize = slider_height /10 * 100 ;
        // document.getElementById('console').innerHTML= `setlayout : ${windowsize} `;
        console.log(windowsize);
        
        for (let i=0; i<sceneInfo.length; i++) {
            sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * windowsize;
            //html파일 section에 style="height: ##px;" 추가하면 해당 section의 높이가 됨 
        }

        //setLayout 할 때 마다 currentScene도 설정해줌
        yOffset = window.pageYOffset;
        
        let totalScrollHeight = 0;
        for(let i =0; i < sceneInfo.length; i++) {
            totalScrollHeight += sceneInfo[i].scrollHeight;
            if (totalScrollHeight >= yOffset) {
                currentScene = i;
                break;
            }

        }    
        //beach, floor, drop area 길이 지정 
        let beachlenNum = 0;
        let floorlenNum = 0;
        let droplenNum = 0;
        for(let i=0; i < sceneInfo.length ; i++){
            if (sceneInfo[i].type == 'beach') {
                beachlenNum += sceneInfo[i].heightNum;
            }
            if (sceneInfo[i].type == 'floor') {
                floorlenNum += sceneInfo[i].heightNum;
            }
            if (sceneInfo[i].type == 'droparea') {
                droplenNum += sceneInfo[i].heightNum;
            }
        }
                
        document.querySelector('.beach').style.height = `${beachlenNum*100}vh`;
        document.querySelector('.floor').style.height = `${floorlenNum*100}vh`;
        document.querySelector('.droparea').style.height = `${droplenNum*100}vh`;
        document.querySelector('.shark').style.height = `10vh`;
        document.querySelector('.shark').style.width = `10vw`;

        //slider 이미지 바로 적용
        let slider_canvas = document.querySelector('.slider')
        let slider_context = document.querySelector('.slider').getContext('2d');
        slider_context.drawImage(sceneInfo[2].objs.images[1],0,0,50,46,0,0,slider_canvas.width,slider_canvas.height);
        // console.log('img setting');
    }

    function calcValues (values, currentYOffset) {
        let rv;
        //현재 씬에서 스크롤된 범위를 비율로 구하기
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / sceneInfo[currentScene].scrollHeight;
        
        if (values.length == 3) {
            //start~end 사이의 애니메이션 실행
            const partScrollStart = values[2].start * scrollHeight;
            const partScrollEnd = values[2].end * scrollHeight;
            const partScrollHeight = partScrollEnd-partScrollStart;

            if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd){
                rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1]-values[0]) + values[0]; 
            }else if (currentYOffset < partScrollStart){
                rv = values[0];
            }else if (currentYOffset > partScrollEnd){
                rv = values[1];
            }
        }else{ 
            rv = scrollRatio * (values[1]-values[0]) + values[0];
        }
        return rv
    }

    //slider의 동작 컨트롤 

    function slidermove(){
        const currentYOffset = yOffset - prevScrollHeight;
        let sliderdisp = 0;

        if (currentScene == 0) {
            sliderdisp = sceneInfo[0].heightNum;
        }else if (currentScene == 1) {
            sliderdisp = calcValues([sceneInfo[0].heightNum,0.5], currentYOffset);
        }else {
            sliderdisp = 0.5;
        }
        document.querySelector('.slider').style.top = `${sliderdisp*100}vh`;
        return sliderdisp
    }

    //slider 거리 계산 1vh = 20m
    function clacdistance(){
        let distratio = yOffset / windowsize + (slidermove() - sceneInfo[0].heightNum);
        // console.log(yOffset,windowsize,slidermove(),sceneInfo[0].heightNum);
        let distance = Math.round((distratio * 20)*10)/10;
        document.getElementById('distance').innerHTML= `distacne : ${distance}`;
        // document.getElementById('console').innerHTML= `console : ${window.innerHeight} ${document.documentElement.clientHeight} ${window.pageYOffset}`;
        return distance
    }

    function playAnimation(){
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;
        const currentYOffset = yOffset - prevScrollHeight;
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight;
        // console.log(scrollRatio);

        if(currentScene ==2 ) {
            if(scrollRatio >= 0.3 && scrollRatio < values.imageSequence[2].start ){
                objs.context.clearRect(0, 0, objs.canvas.width, objs.canvas.height);
                objs.context.drawImage(objs.images[0],0,0,48,36,0,0,objs.canvas.width, objs.canvas.height);
                objs.canvas.style.height = `${calcValues(values.canvasSize_jump, currentYOffset)}vh`;
                objs.canvas.style.width = `${calcValues(values.canvasSize_jump, currentYOffset)*2}vw`;
            }else if(scrollRatio >= values.imageSequence[2].start){
                objs.context.clearRect(0, 0, objs.canvas.width, objs.canvas.height);
                let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                objs.canvas.style.height = `${calcValues(values.canvasSize_jump, currentYOffset)}vh`;
                objs.canvas.style.width = `${calcValues(values.canvasSize_jump, currentYOffset)*2}vw`;
                
                objs.context.drawImage(objs.videoImages[sequence],0,0,480,360,0,0,objs.canvas.width, objs.canvas.height);
            }else{
                sceneInfo[2].objs.context.clearRect(0, 0, sceneInfo[2].objs.canvas.width, sceneInfo[2].objs.canvas.height);    
            }
            if(scrollRatio >= 0.843){
                document.querySelector('.slider').style.opacity = `0`;
            }else{
                document.querySelector('.slider').style.opacity = `1`;
            }

        }else if(currentScene < 2){
            sceneInfo[2].objs.context.clearRect(0, 0, sceneInfo[2].objs.canvas.width, sceneInfo[2].objs.canvas.height);
        }

        // switch(currentScene) {
        //     case 3:
        //         objs.context.clearRect(0, 0, objs.canvas.width, objs.canvas.height);
        //         let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
        //         objs.context.drawImage(objs.videoImages[sequence],0,0,window.innerWidth,window.innerHeight*0.5);
        //         break;
        //     case !3:
        //         objs.context.clearRect(0, 0, objs.canvas.width, objs.canvas.height);
        // }
    }


    function scrollLoop() {
        //현재 scene을 0으로 시작하고 스크롤할 때 마다 scene 변경 조건을 확인해서 증가시키거나 감소시키는듯 
        //아래서 새로고침해도 스크롤 하면 조건에 들어오니까 바로 찾을 수 있는듯 (setLayout에 세팅 없었을때)
        //현재 화면의 상단과 해당 section이 만나는 경우가 전환시점
        enterNewScene = false;
        prevScrollHeight = 0;
        for(let i = 0; i<currentScene; i++) {
            prevScrollHeight += sceneInfo[i].scrollHeight;
        }

        if(yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight){
            enterNewScene = true;
            currentScene ++;
        }
        //(아래 방향으로 스크롤)현재 y 위치가 이전 scene들의 높이+지금 secen의 높이보다 커지면 증가  

        if(yOffset < prevScrollHeight){
            enterNewScene = true;
            if (currentScene==0) return; //브라우저 바운스 효과로 인해 yoffset이 -가 되는 경우가 있어 scene이 음수가 되는것을 방지
            currentScene --; 
        }
        //(위 방향으로 스크롤) 현재 y 위치가 이전 scene들의 높이보다 작아지면 감소
        
        if(enterNewScene == true)  return; 
        //장면이 전환되는 시점에는 palyanimation을 실행하지 않도록 처리

        // console.log(currentScene);

        slidermove();
        clacdistance();
        playAnimation();
    }

    function checkgrade(distance){
        let grade = ''
        if(distance < 50){
            grade = 'Cheer up'
        }else if ( 50 <= distance && distance < 70 ){
            grade = 'Good!';
        }else if ( 70 <= distance && distance < 90 ){
            grade = 'Nice!';
        }else if ( 90 <= distance && distance < 99.5 ){
            grade = 'Great!';
        }else if ( 99.5 <= distance && distance < 100 ){
            grade = 'Awsome!';
        }else if ( 100 <= distance ){
            grade = 'Failed';
        }

        return grade 
    }


    window.addEventListener('scroll', () => {
        yOffset = window.pageYOffset;
        // console.log(yOffset);
        scrollLoop()
        // isScrolling();
        // console.log(currentScene);
        // document.getElementById('console').innerHTML= `scroll : ${window.pageYOffset} `;
        //이때 증감을 봐서 끝났는지 확인하자!
    });

    // window.addEventListener('touchstart', document.getElementById('.body').innerHTML= `touchstart`);
    // window.addEventListener('touchmove', document.getElementById('console').innerHTML= `touchmove`);
    // window.addEventListener('touchend', document.getElementById('console').innerHTML= `touchend`);



    window.addEventListener('touchstart',() => {
        gamestate = 'touching';
        console.log(gamestate);
        window.addEventListener('touchmove',() => {
            // console.log('touchmove');
            gamestate = 'touching';
        });
        window.addEventListener('touchend',() => {
            gamestate = 'sliding';
            console.log(gamestate);
            document.querySelector('body').style.touchAction = `none`;
        });
    } );

    setInterval(()=>{
        // console.log(window.onscroll);
        let currentSlidingYoffset = window.pageYOffset;
        if(gamestate == 'sliding'){
            if(slidingYoffset == currentSlidingYoffset){
                let distance = clacdistance();
                let score = 0;
                let grade = '';

                if (distance < 100){
                    score = distance;
                    grade = checkgrade(distance);
                }else if (distance >= 100) {
                    score = 0;
                    grade = checkgrade(distance);
                }
                console.log(grade);
                gamestate = 'end'
                document.getElementById('endmodal').style.display = 'flex';
                document.getElementById('result').innerHTML= `your score is ${score}`;
                document.getElementById('grade').innerHTML= `${grade}`;

            }else {
                slidingYoffset = currentSlidingYoffset ;
            }
        }
    },500);

    document.getElementById('restart').addEventListener('click', ()=> {
        // restart();
        window.scrollTo(0,0);
        // window.scrollTo(0,0);
        // if (window.yOffset==0){
        //     window.location.reload();
        // }
    })

    document.getElementById('reset').addEventListener('click',()=> {
        window.location.reload();
    })


    async function restart(){ // async을 지정해주면 Promise를 리턴하는 함수로 만들어준다.
        window.scrollTo(0,0);
        await Promise.resolve(window.location.reload()); // 프라미스 객체의 then결과를 바로 받는다.
        return 0;
        }
        


    //gamestate == before_playing : scrollloop... (안전빵)
    //gamestate == touching : scrollloop... 
    //gamestate == sliding : scrollloop & setinterval 
    //gamestate == end : opup
    //setinterval을 따로 빼고 state에 따라 동작하게 하자!

    // 터치 이벤트가 end가 되면 set interval로 상태를 확인한다. 
    // 게임 state가 end가 될 때 까지 set interval을 실행하고 더이상 yoffset의 변화가 없으면 game state를 end로 바꿔준다. 
    // restart 이후에는 game state를 초기화해준다.

    // 터치 on
    // 드래그
    // 스크롤 시작 (증/감 가능)
    // 터치 off
    // -> 터치 막아야 됨
    // 스크롤 진행 
    // offset 증가 (예외로 감소할 수도 있음) 
    // offset 증가 또는 감소 
    // offset 증가 또는 감소 멈춤 
    // 게임 종료
    // pop up 
    
    
    // 터치 막기 
    // https://gahyun-web-diary.tistory.com/129


    
    window.addEventListener('load', setLayout);
    window.addEventListener('resize', setLayout);

})();