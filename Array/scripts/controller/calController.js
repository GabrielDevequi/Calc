class CalController {

    constructor() {
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this.lastOperator = '';
        this.lastNumber = '';
        this._operation = [];
        this._displayCalcEl = document.querySelector('#display');
        this._dateEl = document.querySelector('#data');
        this._timeEl = document.querySelector('#hora');
        this._currentDate = new Date();  
        this.initialize();  
        this.initButtonsEvents();
        this.initKeyboard();
    }
    copyToClipboard() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.displayCalc)
            .then(() => {
                console.log('Texto copiado para a área de transferência: ', this.displayCalc);
            })
            .catch(err => {
                console.error('Erro ao copiar o texto: ', err);
            });
        } else {
            
            let input = document.createElement('input');
            input.value = this.displayCalc;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            console.log('Texto copiado para a área de transferência (fallback): ', this.displayCalc);
        }
    }
    pasteFromClipboard() {
        if (navigator.clipboard) {
            navigator.clipboard.readText()
            .then(text => {
                console.log('Texto colado da área de transferência: ', text);
               
                if (!isNaN(text)) { 
                    this.addOperation(parseFloat(text)); 
                } else {
                    
                    let operations = text.split(''); 
                    operations.forEach(char => {
                        if (!isNaN(char)) {
                            this.addOperation(parseInt(char));
                        } else if (this.isOperator(char)) {
                            this.addOperation(char); 
                        }
                    });
                }
                this.setLastNumberToDisplay(); 
            })
            .catch(err => {
                console.error('Erro ao colar o texto: ', err);
            });
        } else {
            console.error('API Clipboard não suportada');
        }
    }

    initialize() {
        this._dateEl.innerHTML = this.formatDate(this._currentDate);
        this._timeEl.innerHTML = this.formatTime(this._currentDate);
        this.setLastNumberToDisplay();
        document.querySelectorAll('.btn-ac').forEach(btn=>{

            btn.addEventListener('dblclick', e=>{

                this.toggleAudio();

            })

        })
    }

    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;



    }

    playAudio(){

            if(this._audioOnOff){
                this._audio.currentTime = 0;
                this._audio.play();
            }
    }

    addEventListenerAll(element, events, fn){
        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);

        });   
     }

     initKeyboard(){

        document.addEventListener('keyup', e=>{

            this.playAudio();

            switch(e.key){
                case'Escape':
                    this.clearAll();
                break;
    
                case'Backspace':
                    this.clearEntry();
                break;
    
                case'+':
                case'-':
                case'*':
                case'/':
                case'%':
                this.addOperation(e.key);
                break;
    
                case'Enter':
                case'=':
                this.calc();
                break;

                
                case'.':
                case',':
                this.addDot();
    
                break;

                case 'c': // Ctrl + C para copiar
                if (e.ctrlKey) this.copyToClipboard();
                break;
            case 'v': // Ctrl + V para colar
                if (e.ctrlKey) this.pasteFromClipboard();
                break;
    
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        this.addOperation(parseInt(e.key));
                        break;


            }

        });

     }

     clearAll(){

        this._operation = [];
        this.lastNumber = '';
        this.lastOperator = '';

        this.setLastNumberToDisplay();

     }

     clearEntry(){

            this._operation.pop();
            this.setLastNumberToDisplay();

     }
     getLastOperation(){
       return this._operation[ this._operation.length-1];


     }
     setLastOperation(value){
        this._operation[ this._operation.length-1] = value;



     }


     isOperator(value){
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);

     }

     pushOperetion(value){
        this._operation.push(value);
        if(this._operation.length > 3){

            this.calc();
        }

     }


     getResult(){
        try{
        return eval(this._operation.join(''));
    } catch(e){
        setTimeout(() => {
            this.setError();
        }, 1);
        
    }
    }

     calc() {
        let last = '';
        this.lastOperator = this.getLastItem();

        if(this._operation.length < 3){
            let firstItem = this._operation[0];
            this._operation = [firstItem, this.lastOperator, this.lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop(); 
        this.lastNumber = this.getResult();

        }else if(this._operation.length == 3){
            
        this.lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();
    
        if (last === '%') {
            let lastNumber = parseFloat(this._operation.pop()); 
            this._operation = [result]; 
        } else {
           
            this._operation = [result];
            if (last) this._operation.push(last); 
        }
    
       this.setLastNumberToDisplay();
     }


     getLastItem(isOperator = true){

        let lastItem;
        for(let i = this._operation.length-1; i>= 0; i--){
          

                if(this.isOperator(this._operation[i]) == isOperator){
                    lastItem = this._operation[i];
                    break; }
    
}
    if(!lastItem){
        lastItem = (isOperator) ? this.lastOperator : this.lastItem
    }
    return lastItem;
  }
    
     setLastNumberToDisplay(){

            let lastNumber = this.getLastItem(false);
            if(!lastNumber) lastNumber = 0;
            this.displayCalc = lastNumber;

     }

     addOperation(value){


            if(isNaN(this.getLastOperation())){
                if(this.isOperator(value)){
                    this.setLastOperation(value);
                    
                } else{
                    this.pushOperetion(value);
                    this.setLastNumberToDisplay();
                }
               
            }else{

                if(this.isOperator(value)){
 
                    this.pushOperetion(value);

                } else {
                    
              let newValue =  this.getLastOperation().toString() + value.toString();
              this.setLastOperation((newValue));
             
                    this.setLastNumberToDisplay();


                }

            }
     }

     setError(){
        this.displayCalc= 'Erro!'
     }

     addDot(){

        let lastOperation = this.getLastOperation()
        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;
        if (this.isOperator(lastOperation) || !lastOperation){
            this.pushOperetion('0.');
        }else{
            this.setLastOperation(lastOperation.toString() + '.');
        }
        this.setLastNumberToDisplay();
     }

    execBtn(value){

        this.playAudio();

        switch(value){
            case'ac':
                this.clearAll();
            break;

            case'ce':
                this.clearEntry();
            break;

            case'soma':
            this.addOperation('+');
            break;


            case'igual':
            this.calc();

            break;


            case'subtracao':
                            this.addOperation('-');

            break;


            case'multiplicacao':
                            this.addOperation('*');

            break;


            case'divisao':
            this.addOperation('/');

            break;



            case'porcento':
                            this.addOperation('%');

            break;


            case'ponto':
            this.addDot();

            break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(value));
                    break;
            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');

        buttons.forEach((btn, index) => {

            this.addEventListenerAll(btn, 'click drag ', e => {

                let textBtn = btn.className.baseVal.replace('btn-','')

                this.execBtn(textBtn);
            });


            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {

                btn.style.cursor = 'pointer';

            })
        });
      }

    formatDate(date) {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    formatTime(date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(valor) {
        if (valor.toString().length > 10) {  
            this.setError();
            window.alert('Muito número, amigão, calma aí!');
            return;
        }
        this._displayCalcEl.innerHTML = valor;  
    }

    get currentDate() {  
        return this._currentDate;
    }

    set currentDate(data) {  
        this._currentDate = data;
        this._dateEl.innerHTML = this.formatDate(data);
        this._timeEl.innerHTML = this.formatTime(data);
    }
}
