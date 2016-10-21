/*(�{�[���h���C���`��)

*/

	var  boldColor=[0.8,0.8,0.8];
	var targetComp=app.project.activeItem;//��

//�{�[���h�R���|�ɃR���|�T�C�Y�̕��ʂ����
//MASK�V�F�C�v�Ő}�`��`��
var boldBaseLayer=targetComp.layers.addSolid(boldColor,"boldBase",targetComp.width,targetComp.height,targetComp.pixelAspect);
//�w��䗦�Ń{�b�N�X��`��
var myBoxOrder=90;//%�w��
var myMargin=(100-myBoxOrder)/2;
var myWidth=boldBaseLayer.width;
var myHeight=boldBaseLayer.height;
	// Add Shape
	var myBox    = boldBaseLayer.mask.addProperty("ADBE Mask Atom");
	var boxShape = new Shape();
	boxShape.vertices =[
	[myWidth*myMargin/100,myHeight*myMargin/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*myMargin/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*(myBoxOrder+myMargin)/100],
	[myWidth*myMargin/100,myHeight*(myBoxOrder+myMargin)/100]
	];
	myBox.maskShape.setValue(boxShape);
	myBox.name="box";
	myBox.maskMode=MaskMode.NONE;
//�P�C��������1
	var myLine	=	boldBaseLayer.mask.addProperty("ADBE Mask Atom");
	var lineShape	= new Shape();
	lineShape.vertices =[
	[myWidth*myMargin/100,myHeight*(myMargin+myBoxOrder*(1/3))/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*(myMargin+myBoxOrder*(1/3))/100]
	];
	myLine.maskShape.setValue(lineShape);
	myLine.name="line0";
	myLine.maskMode=MaskMode.NONE;
//�P�C��������2
	myLine	=	boldBaseLayer.mask.addProperty("ADBE Mask Atom");
	lineShape	= new Shape();
	lineShape.vertices =[
	[myWidth*myMargin/100,myHeight*(myMargin+myBoxOrder*(2/3))/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*(myMargin+myBoxOrder*(2/3))/100]
	];
	myLine.maskShape.setValue(lineShape);
	myLine.name="line1";
	myLine.maskMode=MaskMode.NONE;

