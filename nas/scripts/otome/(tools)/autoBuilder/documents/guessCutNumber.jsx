/*	guessCutNumber(String,myScene,myOpus,myTitle)
����	������
�ߒl	���ʃp�X

�^����ꂽ������𕪉����ăJ�b�g���𐄑�����
�����񂩂琄�肵���f�[�^�𕔕��I�ɒu��������w�肪�\

�ʏ�̓t�@�C�������t���p�X�ŗ^����

�z�肳��镶����̗�

/c/Workshop/����W�c/���[�N�O���[�v/�^�C�g��01/�V�[��12/�J�b�g123/C-123-0000.tst
c:\Workshop\����W�c\���[�N�O���[�v\�^�C�g��01\�V�[��12\�J�b�g123\C-123-0000.tst
�f�X�N�g�b�v:myDrive:����W�c:���[�N�O���[�v:�^�C�g��/01:�V�[��/12:�J�b�g/123:C-123-0000.tst
���̍یÂ�Mac�̃p�X�͍l���̊O�ɂ��������������ǁc�v�`�F�b�N


���^�X�݊��̃J�b�g�ԍ��L�ڕ���
�Z�p���[�^��"-"
�\�L��	(�J�b�g�ԍ��v���t�B�b�N�X="C")-SceneNo-CutNo
	C-124-0023
nas�\�L
�Z�p���[�^��"-"
�\�L��	�^�C�g��-[(���v���t�B�b�N�X="[Op]/[#]")Opus-][(���v���t�B�b�N�X="[S#]")SceneNo-](���v���t�B�b�N�X="[C#]")CutNo
�J�b�g�ԍ��͌��p�Z�p���[�^�Ō��p��\�L�\
�^�C�g���̓^�C�g���Z�p���[�^�Ő���ԍ��̕��L�\

	poco-Pilot--C023 / ssy-c#0021 / �����Y#02-�������̏�-c#012_014_030

4�v�f�ȏ�Ȃ��납�珇�� �J�b�g�\�L/�V�[���\�L/����ԍ�/�^�C�g��
3�v�f�Ȃ��납�珇�� �J�b�g�\�L/�V�[���\�L/�^�C�g��
3�v�f�ȏ�Ȃ��납�珇�� �J�b�g�\�L/�V�[���\�L/����ԍ�/�^�C�g��


 */

nas.otome.guessCutNumber=function(myString,myScene,myOpus,myTitle)
{
//���������Ȃ���Ώ������f
	if((! myString)||(myString.length)){return false};//����͕�����"000"���G���[�ɂȂ�̂ł悭�Ȃ�����
	if(! myScene){myScene="S#--"};
	if(! myOpus ){myOpus ="Op--"};
	if(! myTitle){myTitle="���ݒ�"};

//�t�@�C���p�X��z�肵�ăp�X��؂蕶���Ŕz��Ɋi�[���� (�~����)
	var myPathArray=new Array();
var mySep="/"//unix�^�C�v
//	if(myString.match(/^(\/[^\/]+)+/g)){mySep="/"};
	if(myString.match(/^[a-z]:(\\[^\\]+)+/g)){mySep="\\"};//dos
	if(myString.match(/^(:[^:]+)+/g)){mySep=":"};//oldMac
	myPathArray=myString.split(mySep).reverse();
	
//�v�f�������Ė����ɋ�I�u�W�F�N�g������Ύ̂Ă�
	if((myPathArray.length>2)&&(myPathArray[myPathArray.length-1]=="")){myPathArray.pop()}
//���v�f�������\�Ȃ�Ε������āA����
	if(myPathArray[0].match(/^C\-[^-]+\-[^-]+$/))
	{
//		���^�X�̌݊��\���Ɛ��������̂Ń`�F�b�N���ĕ���
	}
return myPathArray.join("_");
}
St="c:\Workshop\����W�c\���[�N�O���[�v\�^�C�g��01\�V�[��12\�J�b�g123\C-123-0000.tst"
nas.otome.guessCutNumber(St);
