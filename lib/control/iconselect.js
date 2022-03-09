
/**
 *
 * Created with NetBeans IDE
 *
 * Code     : Icon Select JS
 * Version  : 1.0
 *
 * User     : Bugra OZDEN
 * Site     : http://www.bugraozden.com
 * Mail     : bugra.ozden@gmail.com
 *
 * Date     : 10/30/13
 * Time     : 01:10 PM
 *
 */

IconSelect.DEFAULT = {};
IconSelect.DEFAULT.SELECTED_ICON_WIDTH = 48;
IconSelect.DEFAULT.SELECTED_ICON_HEIGHT = 48;
IconSelect.DEFAULT.SELECTED_BOX_PADDING = 1;
IconSelect.DEFAULT.SELECTED_BOX_PADDING_RIGHT = 12;
IconSelect.DEFAULT.ICONS_WIDTH = 32;
IconSelect.DEFAULT.ICONS_HEIGHT = 32;
IconSelect.DEFAULT.BOX_ICON_SPACE = 1;
IconSelect.DEFAULT.HORIZONTAL_ICON_NUMBER = 3;
IconSelect.DEFAULT.VECTORAL_ICON_NUMBER = 3;

IconSelect.COMPONENT_ICON_FILE_PATH = "static/icon/arrow.png";

function IconSelect(_$_$elementID, _$_$parameters) {
    
    var _icons = [];
    var _selectedIndex = -1;
    var _boxScroll;
    
    var _default = IconSelect.DEFAULT;

    function _init() {
        
        //parametreler boş gelirse
        if(!_$_$parameters) _$_$parameters = {};
        //En üst elementi seç
        if(_View.setIconSelectElement(_$_$elementID)){
            
            //set parameters
            _$_$parameters = _Model.checkParameters(_$_$parameters);
            //create UI
            var ui = _View.createUI(_$_$parameters, _$_$elementID);
            //basıldığında göster/gizle
            _View.iconSelectElement.onclick = function(){
                _View.showBox();
            };
            
            //Başlangıçta gizle
            _View.showBox(false);

            //Nesneye basıldığında gizlemeyi iptal et.
            _View.iconSelectElement.addEventListener('click', function(_$event){
                _$event.stopPropagation();             
            });
            
            //dışarı basıldığında gizle.
            window.addEventListener('click', function(){
                _View.showBox(false);
            });
           
        }else{
            alert("Element not found.");
        }
        
    }
    
    //Tüm iconları yeniden yükle.
    this.refresh = function(_$icons){
        
        _icons = [];
        
        var setSelectedIndex = this.setSelectedIndex;
        
        for(var i = 0; i < _$icons.length; i++){
            _$icons[i].element = _View.createIcon(_$icons[i].iconFilePath, _$icons[i].iconId, _$icons[i].iconValue, i, _$_$parameters);
            _$icons[i].element.onclick = function(){
                setSelectedIndex(this.childNodes[0].getAttribute('icon-index'));
                
            };
            _icons.push(_$icons[i]);
            
        }
        
        var horizontalIconNumber = Math.round((_$icons.length) / _$_$parameters.vectoralIconNumber);
        
        _View.boxElement.style.height = ((_$_$parameters.iconsHeight + 2) * horizontalIconNumber) + 
                ((horizontalIconNumber + 1) * _$_$parameters.boxIconSpace);
        this.setSelectedIndex(0);
        
    };
    
    //icon listesini al.
    this.getIcons = function(){ return _icons; };
    
    //iconu seçili hale gelir.
    this.setSelectedIndex = function(_$index){
        
        var icon;
        
        if(_icons.length > _$index)
            icon = _icons[_$index];
        
        if(icon){
            //eski icondan seçilme özelliğini kaldır.
            if(_selectedIndex != -1) _icons[_selectedIndex].element.setAttribute('class','icon');
            _selectedIndex = _$index;
            _View.selectedIconImgElement.setAttribute('src', icon.iconFilePath);
            if(_selectedIndex != -1) _icons[_selectedIndex].element.setAttribute('class','icon selected');
        }
        
        _View.iconSelectElement.dispatchEvent(new Event('changed'));
        
        //_View.showBox(false);
        
    };
    
    this.getSelectedIndex = function(){ return _selectedIndex; };
    this.getSelectedId = function() { return _icons[_selectedIndex].iconId; };
    this.getSelectedValue = function(){ return _icons[_selectedIndex].iconValue };
    this.getSelectedFilePath = function(){ return _icons[_selectedIndex].iconFilePath };
    
    
    
    //### VIEW CLASS ###
        
    function _View(){}
    
    _View.iconSelectElement;
    _View.boxElement;
    _View.boxScrollElement;
    _View.selectedIconImgElement;
    _View.selectedIconElement;
    
    _View.showBox = function(_$isShown){
                
         if(_$isShown == null) {
             _$isShown = (_View.boxElement.style.display == "none") ? true : false;
         }
                
        if(_$isShown) {
            _View.boxElement.style.display = "block";
            _View.boxScrollElement.style.display = "block";
            _boxScroll = (_boxScroll) ? _boxScroll : new iScroll(_$_$elementID + "-box-scroll");
        }else{
            _View.boxElement.style.display = "none";
            _View.boxScrollElement.style.display = "none";
        }
        
        _View.boxElement.style.display = (_$isShown) ? "block" : "none";
        
        
            
    };
    
    _View.setIconSelectElement = function(_$elementID){
        _View.iconSelectElement = document.getElementById(_$elementID);
        return _View.iconSelectElement;
    };
    
    _View.clearUI = function(){
        _View.iconSelectElement.innerHTML = "";
    };
    
    _View.clearIcons = function(){
        _View.boxElement.innerHTML = "";
    };
    
    _View.createUI = function(_$parameters){
        
        /* HTML MODEL
        
        <div id="my-icon-select" class="icon-select">
            <div class="selected-box">
                <div class="selected-icon"><img src="images/icons/i2.png"></div>
                <div class="component-icon"><img src="images/control/icon-select/arrow.png"></div>
                <div class="box">
                    <div class="icon"><img src="images/icons/i1.png"></div>
                    <div class="icon selected"><img src="images/icons/i2.png"></div>
                    <div class="icon"><img src="images/icons/i3.png"></div>
                    <div class="icon"><img src="images/icons/i4.png"></div>
                    <div class="icon"><img src="images/icons/i3.png"></div>
                    <div class="icon"><img src="images/icons/i4.png"></div>
                    <div class="icon"><img src="images/icons/i5.png"></div>
                    <div class="icon"><img src="images/icons/i6.png"></div>
                    <div class="icon"><img src="images/icons/i7.png"></div>
                    <div class="icon"><img src="images/icons/i8.png"></div>
                </div>
            </div>
        </div>
        
        */
        
        _View.clearUI();
        
        _View.iconSelectElement.setAttribute('class', 'icon-select');
        
        var selectedBoxElement = document.createElement('div');
        selectedBoxElement.setAttribute('class' ,'selected-box');
        
        var selectedIconElement = document.createElement('div');
        selectedIconElement.setAttribute('class' ,'selected-icon');
        
        _View.selectedIconImgElement = document.createElement('img');
        _View.selectedIconImgElement.setAttribute('src', '');
        selectedIconElement.appendChild(_View.selectedIconImgElement);
        
        var componentIconElement = document.createElement('div');
        componentIconElement.setAttribute('class', 'component-icon');
        
        var componentIconImgElement = document.createElement('img');
        componentIconImgElement.setAttribute('src', IconSelect.COMPONENT_ICON_FILE_PATH );
        componentIconElement.appendChild(componentIconImgElement);
        
        _View.boxScrollElement = document.createElement('div');
        _View.boxScrollElement.setAttribute('id',_$_$elementID + "-box-scroll");
        _View.boxScrollElement.setAttribute('class', 'box');
        
        _View.boxElement = document.createElement('div');
        
        //_View.boxElement.setAttribute('class', 'box');
        _View.boxScrollElement.appendChild(_View.boxElement);
        
        _View.selectedIconImgElement.setAttribute('width', _$parameters.selectedIconWidth);
        _View.selectedIconImgElement.setAttribute('height', _$parameters.selectedIconHeight);
        selectedIconElement.style.width = _$parameters.selectedIconWidth;
        selectedIconElement.style.height = _$parameters.selectedIconHeight;
        selectedBoxElement.style.width = _$parameters.selectedIconWidth + _$parameters.selectedBoxPadding + _$parameters.selectedBoxPaddingRight;
        selectedBoxElement.style.height = _$parameters.selectedIconHeight + (_$parameters.selectedBoxPadding * 2);
        selectedIconElement.style.top = _$parameters.selectedBoxPadding;
        selectedIconElement.style.left = _$parameters.selectedBoxPadding;
        componentIconElement.style.bottom = 4 + _$parameters.selectedBoxPadding;
        
        _View.boxScrollElement.style.left = parseInt(selectedBoxElement.style.width) + 1;
        
        _View.boxScrollElement.style.width = ((_$parameters.iconsWidth + 2) * _$parameters.vectoralIconNumber) + 
                ((_$parameters.vectoralIconNumber + 1) * _$parameters.boxIconSpace);
        _View.boxScrollElement.style.height = ((_$parameters.iconsHeight + 2) * _$parameters.horizontalIconNumber) + 
                ((_$parameters.horizontalIconNumber + 1) * _$parameters.boxIconSpace);
         
        _View.boxElement.style.left = _View.boxScrollElement.style.left;
        _View.boxElement.style.width = _View.boxScrollElement.style.width;
        
        _View.iconSelectElement.appendChild(selectedBoxElement);
        selectedBoxElement.appendChild(selectedIconElement);
        selectedBoxElement.appendChild(componentIconElement);
        selectedBoxElement.appendChild(_View.boxScrollElement);
        
        
        var results = {};
        results['iconSelectElement'] = _View.iconSelectElement;
        results['selectedBoxElement'] = selectedBoxElement;
        results['selectedIconElement'] = selectedIconElement;
        results['selectedIconImgElement'] = _View.selectedIconImgElement;
        results['componentIconElement'] = componentIconElement;
        results['componentIconImgElement'] = componentIconImgElement;
        
        return results;
        
        
       //trigger: created ( run setValues )
        
    };
        
    _View.createIcon = function(_$iconFilePath, _$iconId, _$iconValue, _$index, _$parameters){
        
        /* HTML MODEL 
         
         <div class="icon"><img src="images/icons/i1.png"></div>
         
         */
        
        var iconElement = document.createElement('div');
        iconElement.setAttribute('class', 'icon');
        iconElement.style.width = _$parameters.iconsWidth;
        iconElement.style.height = _$parameters.iconsHeight;
        iconElement.style.marginLeft = _$parameters.boxIconSpace;
        iconElement.style.marginTop = _$parameters.boxIconSpace;
        
        var iconImgElement = document.createElement('img');
        iconImgElement.setAttribute('src', _$iconFilePath);
        iconImgElement.setAttribute('icon-id', _$iconId);
        iconImgElement.setAttribute('icon-value', _$iconValue);
        iconImgElement.setAttribute('icon-index', _$index);
        iconImgElement.setAttribute('width', _$parameters.iconsWidth);
        iconImgElement.setAttribute('height', _$parameters.iconsHeight);
        
        iconElement.appendChild(iconImgElement);
        _View.boxElement.appendChild(iconElement);
        
        return iconElement;
        
    };
    
    //### MODEL CLASS ###
    
    function _Model(){}
    
    //TODO: params değişkenini kaldır yeni oluştursun.
    _Model.checkParameters = function(_$parameters){
        
        _$parameters.selectedIconWidth          = (_$parameters.selectedIconWidth)          ? _$parameters.selectedIconWidth        : _default.SELECTED_ICON_WIDTH;
        _$parameters.selectedIconHeight         = (_$parameters.selectedIconHeight)         ? _$parameters.selectedIconHeight       : _default.SELECTED_ICON_HEIGHT;
        _$parameters.selectedBoxPadding         = (_$parameters.selectedBoxPadding)         ? _$parameters.selectedBoxPadding       : _default.SELECTED_BOX_PADDING;
        _$parameters.selectedBoxPaddingRight    = (_$parameters.selectedBoxPaddingRight)    ? _$parameters.selectedBoxPaddingRight  : _default.SELECTED_BOX_PADDING_RIGHT;
        _$parameters.iconsWidth                 = (_$parameters.iconsWidth)                 ? _$parameters.iconsWidth               : _default.ICONS_WIDTH;
        _$parameters.iconsHeight                = (_$parameters.iconsHeight)                ? _$parameters.iconsHeight              : _default.ICONS_HEIGHT;
        _$parameters.boxIconSpace               = (_$parameters.boxIconSpace)               ? _$parameters.boxIconSpace             : _default.BOX_ICON_SPACE;
        _$parameters.vectoralIconNumber         = (_$parameters.vectoralIconNumber)         ? _$parameters.vectoralIconNumber       : _default.VECTORAL_ICON_NUMBER;
        _$parameters.horizontalIconNumber       = (_$parameters.horizontalIconNumber)       ? _$parameters.horizontalIconNumber     : _default.HORIZONTAL_ICON_NUMBER;
    
        return _$parameters;
    
    };
    
    _init();
    
}