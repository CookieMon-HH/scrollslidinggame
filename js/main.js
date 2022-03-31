(() => {
    
    let yOffset = 0; //window.pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0; //현재 스크롤 위치 보다 이전에 위치한 스크롤 섹션들의 스크롤 높이의 합
    let currentScene = 0; //현재 활성화 된 씬 (scroll-section)
    let enterNewScene = false; //새로운 scene이 시작된 순간 true
    let windowsize = 0;

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
                    `./images/shark/shark_underthesea.png`
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
        windowsize = window.innerHeight;

        for (let i=0; i<sceneInfo.length; i++) {
            sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
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


    window.addEventListener('scroll', () => {
        yOffset = window.pageYOffset;
        scrollLoop()
        // console.log(currentScene);
    });
    
    window.addEventListener('load', setLayout);
    window.addEventListener('resize', setLayout);

})();