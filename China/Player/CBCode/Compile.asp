<%@ Language=VBScript %>
<%
' calling flex code:
'private var service:HTTPService = null;
'
'service = new HTTPService;
'service.addEventListener("result", updateDataResultHandler);
'service.addEventListener("fault", updateDataFaultHandler);
'
'var url:String = "http://www.x-in-y.com/cb/compile.asp?Folder=" + folder + "&File=" + file+"&SubFolder="+SubFolder
'service.cancel();  // Cancel all previous pending calls.
'service.url = url;
'service.method = "POST"; 
'service.resultFormat = "xml";
'var params:Object = new Object();
'params.Data = xml.toString(); // asp picks this up as Request.Form("Data")
'service.send(params);

on error resume next
Response.Expires = -1  ' Don't Cache

Data = Request.Form
if Left(Data,5) = "Data=" then Data = Request.Form("Data") ' work with flash or flex
Folder = Request.QueryString("Folder")
SubFolder = Request.QueryString("SubFolder")
File = Request.QueryString("File")

fullFolder=Folder+SubFolder

set msserver = Server.CreateObject("CharacterServer.CharacterServer")
fullpath = Server.MapPath(fullFolder+"/"+File)
fullmpr = Server.MapPath(fullpath+".mpr")

set fso=Server.CreateObject("Scripting.FileSystemObject")
if not fso.FolderExists(Server.MapPath(Folder)) then fso.CreateFolder(Server.MapPath(Folder))
if not fso.FolderExists(Server.MapPath(fullFolder)) then fso.CreateFolder(Server.MapPath(fullFolder))

set ts = fso.OpenTextFile(fullmpr, 2)
 ts.Write Data
 ts.Close

fileactual = msserver.Render(msserver.ConvertUTF8(Data), fullpath)
if Err = 0 then 
     response.Write "<?xml version=""1.0"" encoding=""UTF-8""?>"
     response.Write "<response success=""true""/>"
else
     response.Write "<?xml version=""1.0"" encoding=""UTF-8""?>"
     response.Write "<response success=""false"" error=""" & Err.Description & """/>"
end if
%>