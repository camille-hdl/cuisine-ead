//@flow
import { prettyPrintXML, removeBlankLines, getEadBody } from "../../src/lib/output-recipes.js";

test("getEadBody", () => {
    const input = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE ead PUBLIC "+//ISBN 1-931666-00-8//DTD ead.dtd (Encoded Archival Description (EAD) Version 2002)//EN" "ead.dtd">
<ead xmlns:xlink="http://www.w3.org/1999/xlink">
<eadheader dateencoding="iso8601" langencoding="iso639-2b" repositoryencoding="iso15511">
<eadid xlink:type="simple" xlink:href="http://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_001885">aze</eadid>
<filedesc>
<titlestmt>
<titleproper>Title 
<emph>with</emph> spaces
</titleproper>
<subtitle>subt</subtitle><author>author <p></p></author>
</titlestmt></filedesc></eadheader>
</ead>`;
    const [xmlHeader, eadBody] = getEadBody(input);
    expect(xmlHeader).toEqual(
        `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE ead PUBLIC "+//ISBN 1-931666-00-8//DTD ead.dtd (Encoded Archival Description (EAD) Version 2002)//EN" "ead.dtd">`
    );
    expect(eadBody).toEqual(`<ead xmlns:xlink="http://www.w3.org/1999/xlink">
<eadheader dateencoding="iso8601" langencoding="iso639-2b" repositoryencoding="iso15511">
<eadid xlink:type="simple" xlink:href="http://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_001885">aze</eadid>
<filedesc>
<titlestmt>
<titleproper>Title 
<emph>with</emph> spaces
</titleproper>
<subtitle>subt</subtitle><author>author <p></p></author>
</titlestmt></filedesc></eadheader>
</ead>`);
});

test("prettyPrintXML", () => {
    const input = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ead PUBLIC "+//ISBN 1-931666-00-8//DTD ead.dtd (Encoded Archival Description (EAD) Version 2002)//EN" "ead.dtd">
<ead xmlns:xlink="http://www.w3.org/1999/xlink">
     <eadheader dateencoding="iso8601" langencoding="iso639-2b" repositoryencoding="iso15511">
      <eadid xlink:type="simple" xlink:href="http://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_001885">aze</eadid>
<filedesc>
<titlestmt>
       <titleproper>Title 
       <emph>with</emph> spaces
       </titleproper>
    <subtitle>subt</subtitle><author>author <p></p></author>
</titlestmt></filedesc></eadheader>
</ead>`;
    const expected = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ead PUBLIC "+//ISBN 1-931666-00-8//DTD ead.dtd (Encoded Archival Description (EAD) Version 2002)//EN" "ead.dtd">
<ead xmlns:xlink="http://www.w3.org/1999/xlink">
  <eadheader dateencoding="iso8601" langencoding="iso639-2b" repositoryencoding="iso15511">
    <eadid xlink:type="simple" xlink:href="http://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_001885">aze</eadid>
    <filedesc>
      <titlestmt>
        <titleproper>Title <emph>with</emph> spaces </titleproper>
        <subtitle>subt</subtitle>
        <author>author <p></p></author>
      </titlestmt>
    </filedesc>
  </eadheader>
</ead>`;
    expect(prettyPrintXML(input)).toEqual(expected);
});

test("removeBlankLines", () => {
    const input = `<?xml version="1.0" encoding="UTF-8"?><ead xmlns:xlink="http://www.w3.org/1999/xlink">
     <eadheader dateencoding="iso8601" langencoding="iso639-2b" repositoryencoding="iso15511">

      <eadid xlink:type="simple" xlink:href="http://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_001885">aze</eadid>
<filedesc>


<titlestmt>
<a></a>
       <titleproper>Title 

       <emph>with</emph> spaces
       </titleproper>
    <subtitle>subt</subtitle><author>author <p></p></author>
</titlestmt></filedesc></eadheader>
</ead>`;
    const expected = `<?xml version="1.0" encoding="UTF-8"?><ead xmlns:xlink="http://www.w3.org/1999/xlink">
     <eadheader dateencoding="iso8601" langencoding="iso639-2b" repositoryencoding="iso15511">
      <eadid xlink:type="simple" xlink:href="http://www.siv.archives-nationales.culture.gouv.fr/siv/IR/FRAN_IR_001885">aze</eadid>
<filedesc>
<titlestmt>
<a></a>
       <titleproper>Title 
       <emph>with</emph> spaces
       </titleproper>
    <subtitle>subt</subtitle><author>author <p></p></author>
</titlestmt></filedesc></eadheader>
</ead>`;
    expect(removeBlankLines(input)).toEqual(expected);
});
