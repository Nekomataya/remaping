/*		nas.GUI.addMultiControl(Parent,type,dim,left,top,width,height,option,labelText,defaultValue,minValue,maxValue)

	��]�R���g���[��
�����R���g���[��
UI�ɊȈՓI�ȃR���g���[���G�������g��ݒ肷��
�߂�l�͊g�����\�b�h���������p�l���R���g���[��

�R���g���[���̓p�l���I�u�W�F�N�g�̒��ɂ��炩����UI���z�u����Ă���̂ŊȒP�Ɏg�p�ł���B

Parent	�e�I�u�W�F�N�g
type	�R���g���[���^�C�v angle number color position speed
dim	�R���g���[���̎��� 1�`5
labelText	���x���e�L�X�g�@(�������z��̏ꍇ�� �������蓖��)
defaultValue	�����l�@�ȗ��l�̓^�C�v�ˑ��@(�������z��̏ꍇ�� �������蓖�ā@�P���̏ꍇ�͑S�ĂɓK�p)
minValue	�X���C�_�̍ŏ��l�@�ȗ��l�̓^�C�v�ˑ��@(�������z��̏ꍇ�� �������蓖�ā@�P���̏ꍇ�͑S�ĂɓK�p)
maxValue	�X���C�_�̍ő�l�@�ȗ��l�̓^�C�v�ˑ��@(�������z��̏ꍇ�� �������蓖�ā@�P���̏ꍇ�͑S�ĂɓK�p)

left,top	�`��ʒu�@���j�b�g��
widhth,height 	�R���g���[���T�C�Y ���j�b�g��
option ���K���I�v�V�����@true�Ȃ�l���X���C�_�̐����l�ɂ����߂�B�����l�� false

	�R���g���[���v���p�e�B
MultiCntrol.type	������@�R���g���[���^�C�v��\���@���������ȊO���������֎~
MultiCntrol.dim	�����@�R���g���[���̎�����\���B�@���������ȊO���������֎~
MultiCntrol.value	�R���g���[���̌��݂̒l�����@�������R���g���[���̏ꍇ�͔z��

	�R���g���[�����\�b�h
MultiControl.set(�l[,�C���f�b�N�X])	�O������l��ݒ肷�郁�\�b�h�@���l�̂ݎ�t��B���������[�h�̏ꍇ�͔z��ŗ^���邩�A�C���f�b�N�X�Ŏw��ł���

�^�C�v���Ƃɏ����l�E�������͈قȂ�

----type	������	�����l	�ŏ�	�ő�	���x��
   number	1	0	0	  100	���l 00 01 02 03 ...
      angle	1	0	0	  360	�p�x(��)01 02 03...
   positon	2	0	0	3000	�ʒu x y z 01 02 03...
       color	3	0	0	       1	�F(rgb) r g b a 00 01 02 ...

�������́A���[�U�̎��R�����A�R���g���[���z�u�͕K���c�����ɍs�Ȃ���̂ł��܂葽���Ǝg���Â炭�Ȃ�͂�

*/
	nas.GUI.addMultiControl=function(Parent,type,dim,left,top,width,height,option,labelText,defaultValue,minValue,maxValue)
	{
		//type�ʏ����l
		defValue=new Object();
		defValue["number"]=[1,0,0,100,["���l"]];
		defValue["angle"]=[1,0,0,360,["�p�x(��)"]];
		defValue["position"]=[2,0,-3000,3000,["�ʒu","x","y","z"]];
		defValue["color"]=[3,0,0,1,["RGB","r","g","b","a"]];
		//type����
			if(! type){type="number"};
		//�^�C�v�ʂɏ����l���o��
			if(! dim){dim=defValue[type][0]}else{dim=Math.round(Math.abs(dim))}
			if(! left){left=0};
			if(! top){top=0};
			if((! width)||(width<3)){width=3};
//			if((! height)||(height<(2*dim+1))){height=(2*dim+1)};//�ŏ��T�C�Y����
			if((! height)||(height<dim+1)){height=dim+1};//�ŏ��T�C�Y����
			if(type=="angle"){height+=dim};
			if(! labelText){
				labelText=defValue[type][4];//�����I�ɂ͔z��œ���
			}else{
				if(!(labelText instanceof Array)){	labelText=[labelText]}
			}
			if(labelText.length<(dim+1))
			{var addCount=(dim+3)-labelText.length;
				for(var myCount=1;myCount<=addCount;myCount++)
				{
					labelText.push(nas.Zf(myCount,2));
				}
			}
			if(! defaultValue){	defaultValue=defValue[type][1]};
			if(! minValue){	minValue=defValue[type][2]};
			if(! maxValue){	maxValue=defValue[type][3]};
		//�g���[���i�p�l���j
		var myMC=nas.GUI.addPanel(Parent,labelText[0],left,top,width,height);
			myMC.valueType=type
			myMC.dim=dim
		//�^�C�v�ʊe�l�ݒ�
			if(myMC.dim>1){
				myMC.value        =new Array(dim);
				myMC.minValue  =new Array(dim);
				myMC.maxValue =new Array(dim);
				if(defaultValue instanceof Array){
					//�w��l�������Ȃ�@���邾�����ɐݒ�@�s�����͋K��l�Ŗ��߂�
					for(var idx=0;idx<dim;idx++)
					{
						if(defaultValue.length<idx)
						{
							myMC.value[idx]=defaultValue[idx]
						}else{
							myMC.value[idx]=defValue[type][1]
						}
					}
				}else{
					//�l���ЂƂ����Ȃ�S�Ă̗v�f�ɓK�p
					for(var idx=0;idx<myMC.dim;idx++)
					{
							myMC.value[idx]=defaultValue;
					}
				}

				if(minValue instanceof Array){
					//�w��l�������Ȃ�@���邾�����ɐݒ�@�s�����͋K��l�Ŗ��߂�
					for(var idx=0;idx<dim;idx++)
					{
						if(minValue.length<idx)
						{
							myMC.minValue[idx]=minValue[idx]
						}else{
							myMC.minValue[idx]=defValue[type][2]
						}
					}
				}else{
					//�l���ЂƂ����Ȃ�S�Ă̗v�f�ɓK�p
					for(var idx=0;idx<dim;idx++)
					{
							myMC.minValue[idx]=minValue;
					}
				}

				if(maxValue instanceof Array){
					//�w��l�������Ȃ�@���邾�����ɐݒ�@�s�����͋K��l�Ŗ��߂�
					for(var idx=0;idx<dim;idx++)
					{
						if(maxValue.length<idx)
						{
							myMC.maxValue[idx]=maxValue[idx]
						}else{
							myMC.maxValue[idx]=defValue[type][2]
						}
					}
				}else{
					//�l���ЂƂ����Ȃ�S�Ă̗v�f�ɓK�p
					for(var idx=0;idx<dim;idx++)
					{
							myMC.maxValue[idx]=maxValue;
					}
				}

			}else{
				myMC.value=defaultValue;
				myMC.minValue  =minValue;
				myMC.maxValue =maxValue;
			}

			myMC.isReg=(option)?option:false;
//�l�e�L�X�g������
			var shiftL=(type=="angle")? 1:0;			var spanT=(type=="angle")? 2:1;
	if(dim>1){
					myMC.labelText=new Array();
					myMC.valueText=new Array();
					myMC.valueSlider=new Array();
					myMC.ri=new Array();
for(var idx=0;idx<dim;idx++){
			myMC.labelText[idx]=nas.GUI.addStaticText(myMC,labelText[idx+1].toString(),0,0.2+(idx*spanT),0.5,1);
			myMC.valueText[idx]=nas.GUI.addEditText(myMC,myMC.value[idx].toString(),0.5+shiftL,0.2+(idx*spanT),1,1);
			myMC.valueText[idx].index=idx;
			myMC.valueText[idx].onChange=function()
			{
				if((this.text != this.parent.value[this.index])&&(!(isNaN(this.text))))
				{
					var myValue=this.text*1;
					if(this.parent.isReg)
					{
						if(myValue<this.parent.minValue[this.index]){myValue=this.parent.minValue[this.index]};
						if(myValue>this.parent.maxValue[this.index]){myValue=this.parent.maxValue[this.index]};
					}
					this.parent.set(myValue,this.index);
				}else{this.text=this.parent.value[this.index].toString()}
			}
//�l�X���C�_
			myMC.valueSlider[idx]=nas.GUI.addSlider(myMC,myMC.value[idx],myMC.minValue[idx],myMC.maxValue[idx],1.5,(shiftL)-0.2+(idx*spanT),width-1.5);
			myMC.valueSlider[idx].bounds.height=20;
			myMC.valueSlider[idx].index=idx;
			myMC.valueSlider[idx].onChanging=function()
			{
				if(this.value != this.parent.value[this.index]){		this.parent.set(this.value,this.index)	};
			}
	if(type=="angle"){	
//��]�A�C�R��������
		var iconWidth=1;var iconHeight=2;var myFile=new File();
		myMC.ri[idx]=nas.GUI.addIconButton(myMC,"add degrees 45",0.5,0.2+(idx*2),iconWidth,iconHeight,myFile);//rollButton
		myMC.ri[idx].icon=nas.GUI.systemIcons["rot_01"];
		myMC.ri[idx].enabled=true;
		myMC.ri[idx].index=idx;
		myMC.ri[idx].onClick=function(){
			this.parent.set(this.parent.value[this.index]+45,this.index);
		}
	}
}
	}else{
			myMC.valueText=nas.GUI.addEditText(myMC,myMC.value.toString(),shiftL,0.2,1,1);
			myMC.valueText.onChange=function()
			{
				if((this.text != this.parent.value)&&(!(isNaN(this.text))))
				{
					var myValue=this.text*1;
					if(this.parent.isReg)
					{
						if(myValue<this.parent.minValue){myValue=this.parent.minValue};
						if(myValue>this.parent.maxValue){myValue=this.parent.maxValue};
					}
					this.parent.set(myValue);
				}else{this.text=this.parent.value.toString()}
			}
//�l�X���C�_
			myMC.valueSlider=nas.GUI.addSlider(myMC,myMC.value,myMC.minValue,myMC.maxValue,1,shiftL-0.2,width-1);
			myMC.valueSlider.bounds.height=20;
			myMC.valueSlider.onChanging=function()
			{
				if(this.value != this.parent.value){		this.parent.set(this.value)	};
			}
			if(type=="angle"){
//��]�A�C�R��������
		var iconWidth=1;var iconHeight=2;var myFile=new File();
		myMC.ri=nas.GUI.addIconButton(myMC,"add degrees 45",0,0.2,iconWidth,iconHeight,myFile);//rollButton
		myMC.ri.icon=nas.GUI.systemIcons["rot_01"];
		myMC.ri.enabled=true;
		myMC.ri.index=idx;
		myMC.ri.onClick=function(){
			this.parent.set(this.parent.value+45);
		}
	}
}
//�����g�����s�Ȃ����̂�set()���\�b�h���z��������悤�Ɋg�����K�v
/*
	set( [ �z�� ] )�@���@set( �l,ID )�@���͂��܂������H
*/
		myMC.set=function(newValue,myIndex)
		{
			if(dim>1){
				if(newValue instanceof Array)
				{
					for(var idx=0;idx<this.dim;idx++){if(newValue.length<idx){this.set(newValue[idx],idx)}}
				}else{
					if(!(isNaN(newValue))){
						if(! myIndex){myIndex=0};
						if(this.isReg){
							if(this.valueType=="angle"){
								this.value[myIndex]=this.value[myIndex]%this.maxValue[myIndex]
							}else{
								if(newValue<this.minValue[myIndex]){newValue=this.minValue[myIndex]}
								if(newValue>this.maxValue[myIndex]){newValue=this.maxValue[myIndex]}
							}
						}
						this.value[myIndex]=newValue;
						if(this.valueText[myIndex].text !=newValue){this.valueText[myIndex].text=this.value[myIndex].toString()};
						if(this.valueSlider[myIndex].value !=newValue){this.valueSlider[myIndex].value=this.value[myIndex]};
//�p�x�A�C�R������̎��̂�
						if(this.valueType=="angle"){
							if(this.isReg){this.value[myIndex]=this.value[myIndex]%this.maxValue[myIndex]};
							var count=1+(Math.round(((this.value[myIndex]%360)/360)*24)+24)%24;
							this.ri[myIndex].icon=nas.GUI.systemIcons["rot_"+nas.Zf(count,2)];
						}
						this.onChange();//���\�b�h�̍Ō��onChange���R�[��

					}
				}
				//
			}else{
				if(!(isNaN(newValue))){
					if(this.isReg){
						if(this.valueType=="angle")
						{
							this.value=this.value%this.maxValue
						}else{
							if(newValue<this.minValue){newValue=this.minValue}
							if(newValue>this.maxValue){newValue=this.maxValue}
						}
					}
					this.value=newValue;
					if(this.valueText.text !=newValue){this.valueText.text=this.value.toString()};
					if(this.valueSlider.value !=newValue){this.valueSlider.value=this.value};
//�p�x�A�C�R������̎��̂�
					if(this.valueType=="angle"){
						var count=1+(Math.round(((this.value%360)/360)*24)+24)%24;
						this.ri.icon=nas.GUI.systemIcons["rot_"+nas.Zf(count,2)];
					}
					this.onChange();//���\�b�h�̍Ō��onChange���R�[��
				}
			}
		}
		myMC.onChange=function()
		{
			//��t�@���N�V�����@���[�U�͏㏑���ł���
			return;
		}
		return myMC;
	}

