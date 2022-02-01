(() => {
    
    let yOffset = 0; //window.pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0; //현재 스크롤 위치 보다 이전에 위치한 스크롤 섹션들의 스크롤 높이의 합
    let currentScene = 0; //현재 활성화 된 씬 (scroll-section)
    let enterNewScene = false; //새로운 scene이 시작된 순간 true

    const sceneInfo = [
        {
            //0
            heightNum: 1, 
            scrollHeight: 0
        },
        {
            //1
            heightNum: 2, 
            scrollHeight: 0
        },
        {
            //2
            heightNum: 1, 
            scrollHeight: 0,
            }  
    ];

    function setLayout() {
        //각 스크룔 섹션의 높이 세팅
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
    }

    function calcValues (values, currentYOffest) {
        let rv;
        //현재 씬에서 스크롤된 범위를 비율로 구하기
        let scrollRatio = currentYOffest / sceneInfo[currentScene].scrollHeight; 
        rv = scrollRatio * (values[1]-values[0]) + values[0];
        return rv
    }

    //slider의 동작 컨트롤 
    function slidermove(){
        const currentYOffest = yOffset - prevScrollHeight;

        if (currentScene == 0) {
            let sliderdisp = calcValues([15,50], currentYOffest);
            document.querySelector('.slider').style.top = `${sliderdisp}%`;
        }
        else {
            document.querySelector('.slider').style.top = '50%';
        }

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

        slidermove();
    }

    window.addEventListener('scroll', () => {
        yOffset = window.pageYOffset;
        scrollLoop()
        // console.log(currentScene);
    });
    
    window.addEventListener('load', setLayout);
    window.addEventListener('resize', setLayout);

})();