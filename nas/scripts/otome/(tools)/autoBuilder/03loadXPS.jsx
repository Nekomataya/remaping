/*(03-�V�[�g�Ǎ�)
	
	loadXPS.jsx
	�����p�R�[�h
	�R���|���Ƀ^�C���V�[�g��ǂݍ��݁A������XPS�o�b�t�@���X�V���܂��B
	�����t�@�C�����w��ł��܂��B
*/

//�t�@�C������XPS�o�b�t�@�Ɂ@�V�[�g�ǂݍ���
function test_getSheet(sheetFile)
{
	if(sheetFile){
		var myOpenfile = new File(sheetFile.fsName);
		myOpenfile.encoding="UTF8";
	//	alert(myOpenfile.encoding);
		myOpenfile.open("r");
		myContent = myOpenfile.read();
		myOpenfile.close();
		XPS.readIN(myContent);
		var myIndex=nas.XPSStore.push();//�o�b�t�@�̓��e���X�g�A�Ƀv�b�V������
	//	if(myIndex){nas.XPSStore.setInfo(myIndex,myOpenfile)};
		return;
	}else{
		//�w�肪�Ȃ��ꍇ�̓_�C�A���O���o���āA�ǂݍ��݁@�i�����j
		if(isWindows)
		{
			var mySheetFiles = File.openDialog("�ǂݍ��ރ^�C���V�[�g��I��ł�������","nasXPSheet(*.xps):*.XPS",true);
		}else{
			var mySheetFiles = File.openDialog("�ǂݍ��ރ^�C���V�[�g��I��ł�������","*",true);
		}
if(mySheetFiles instanceof Array){
		if (mySheetFiles.length){
			for (var idx=0;idx<mySheetFiles.length;idx++)
			{
				var mySheetFile=mySheetFiles[idx];
				if (mySheetFile.name.match(/^[a-z_\-\#0-9]+\.xps$/i))
				{
					nas.otome.loadXPS(mySheetFile);
				}
			}
		nas.otome.writeConsole(mySheetFiles.length +" timesheets loaded");
			return true;
		}else {
			alert("�^�C���V�[�g�t�@�C����I�����Ă��������B")
			return false;
		};
}
		if(mySheetFiles instanceof File){
				var mySheetFile=mySheetFiles;
				if (mySheetFile.name.match(/^[a-z_\-\#0-9]+\.xps$/i))
				{
					nas.otome.loadXPS(mySheetFile);
				}
			return true;
		}else {
			alert("�^�C���V�[�g�t�@�C����I�����Ă��������B")
			return false;
		}
	}
}

test_getSheet();//�o�b�t�@�ɓǂݍ���
//
/*
	����Ƃ͕ʂɎw��t�H���_�̍ċA�����Ń^�C���V�[�g�t�@�C�������݂���ꍇ�͑S�Ď�荞�ރ��\�b�h������܂��B
	
	�^�C���V�[�g�́A�^�C���V�[�g�i�[�p�R���|�W�V�������t�b�e�[�W�i�[�t�H���_�A�C�e���z���Ɋi�[�p�R���|������Ă���Ƀe�L�X�g���C���̒l�Ƃ��Ď�荞�݂܂�
	�t�@�C�����E�t�@�C���X�V�����E�t�@�C���T�C�Y�@���t�@�C�����ʏ��Ƃ��ă��C���R�����g�ɋL�^���Ă���܂��B
	
*/