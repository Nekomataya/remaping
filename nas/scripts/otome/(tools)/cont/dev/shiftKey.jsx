/*
	propery�N���X�ɃL�[�ړ����\�b�h�𑝐�
	�^�[�Q�b�g�L�[�����Ԏw��ňړ�����

		property.moveKey(index integer,time float)

	������ �^�[�Q�b�g�̃L�[Index�� �ړ���̎��Ԏw�� ���Ԏw��ȗ��͕s��
	�߂�l�͈ړ���̐V�����L�[��Index

	�ړ��悪�������ԂȂ�Ώ����S�̂��p�X(UNDO���ς܂Ȃ�)
	�ړ���ɃL�[�����݂���ꍇ��AE�̎d�l��u�㏑���v
	�������ԏ�ɃL�[������(���R)�F�߂��Ȃ��悤�ł�
*/
Property.prototype.moveKey=function(myIndex,myTime)
{
//�v���p�e�B�^�C�v��PROPERTY�̍ۂ̂ݎ��s
	if(this.propertyType!=PropertyType.PROPERTY){return false}
//�s�������𔻕�
	if((! myIndex)||(this.numKeys<myIndex)||isNaN(myTime)){return false;}
//�ړ��悪�����Ȃ珈�����̂��p�X
	if(this.keyTime(myIndex)==myTime){return myIndex};
//���L�[�̑������o�b�t�@
	var mySelected	=this.keySelected(myIndex);//�I��?

if(this.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER))
{
	var myInInterpolationType	=this.keyInInterpolationType(myIndex)
	var myOutInterpolationType	=this.keyOutInterpolationType(myIndex);//��ԃ^�C�v�̃R�s�[
	var myTemporalEaseIn	=this.keyInTemporalEase(myIndex);
	var myTemporalEaseOut	=this.keyOutTemporalEase(myIndex);
}
if(this.isSpatial){
	var myRoving	=this.keyRoving(myIndex);//���[�r���O
	var mySpatialAutoBezier	=this.keySpatialAutoBezier(myIndex);
	var mySpatialContinuous	=this.keySpatialContinuous(myIndex);
	var mySpatialInTangents	=this.keyInSpatialTangent(myIndex)
	var mySpatialOutTangents	=this.keyOutSpatialTangent(myIndex);//�^���[���g�̃R�s�[
	var myTemporalAutoBezier	=this.keyTemporalAutoBezier(myIndex);
	var myTemporalContinuous	=this.keyTemporalContinuous(myIndex);
}
//��������UndoGroup
	app.beginUndoGroup("�L�[�t���[���ړ�");
//�V�����L�[���쐬
	var oldKeyLength=this.numKeys;
	var newKeyIndex = this.addKey(myTime);
//�Â��L�[
	var oldKeyIndex = myIndex;
	if((newKeyIndex<=myIndex)&&(this.numKeys>oldKeyLength)){ oldKeyIndex++}
//�l�̕���
	this.setValueAtKey(newKeyIndex,this.keyValue(oldKeyIndex));
//���L�[����
	this.removeKey(oldKeyIndex);
	if(oldKeyIndex<newKeyIndex){newKeyIndex--};//�L�[�폜�ŃC���f�b�N�X�ύX
//�l�̃R�s�[�́A�V�L�[���쐬����O�Ƀo�b�t�@�ɂƂ�Ȃ��ƃL�[�쐬�̉e���ŕω�����̂Ń_��
if(this.isSpatial){
	this.setTemporalContinuousAtKey(newKeyIndex,myTemporalContinuous);
	this.setTemporalAutoBezierAtKey(newKeyIndex,myTemporalAutoBezier);
	this.setSpatialTangentsAtKey(newKeyIndex,mySpatialInTangents,mySpatialOutTangents);//�^���[���g
	this.setSpatialContinuousAtKey(newKeyIndex,mySpatialContinuous);
	this.setSpatialAutoBezierAtKey(newKeyIndex,mySpatialAutoBezier);
	this.setRovingAtKey(newKeyIndex,myRoving);//���[�r���O
}
if(this.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER))
{
	this.setTemporalEaseAtKey(newKeyIndex,myTemporalEaseIn,myTemporalEaseOut);
	this.setInterpolationTypeAtKey(newKeyIndex,myInInterpolationType,myOutInterpolationType);//��ԃ^�C�v

}
	this.setSelectedAtKey(newKeyIndex,mySelected);//�I��?
//�O���[�v����
	app.endUndoGroup();
//(�ړ���ɕω�����\��������̂�)�V�����L�[��Index��Ԃ�
	return newKeyIndex;
}
/*
	��̃��\�b�h���R�[�����郄�h�J�����\�b�h
	�w�莞�Ԃ����Ύ��ԂɂȂ��Ă���
	property.shiftKey(�C���f�b�N�X,���炵����)

 */
Property.prototype.shiftKey=function(myIndex,myShift)
{
//�v���p�e�B�^�C�v��PROPERTY�̍ۂ̂ݎ��s(�ق��ɂ̓L�[���Ȃ�)
	if(this.propertyType!=PropertyType.PROPERTY){return false}
//�s�������𔻕�
	if((! myIndex)||(this.numKeys<myIndex)||isNaN(myShift)){return false;}
//�ړ��悪�����Ȃ珈�����̂��p�X
	if(! myShift){return myIndex};
	return this.moveKey(myIndex,this.keyTime(myIndex)+myShift);
}


//Test �����R�[�h�Ȃ̂Ŏ̂Ăă`���[�_�C

//app.project.activeItem.layer(1).position.moveKey(2,1);
app.project.activeItem.layer(1).position.shiftKey(2,-0.5);


