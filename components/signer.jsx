import React from 'react';
import { Form } from 'semantic-ui-react';
import { PDFAssembler } from 'pdfassembler';
import fileSaver from 'file-saver';


const helloWorldPdf = {
    '/Root': {
      '/Type': '/Catalog',
      '/Pages': {
        '/Type': '/Pages',
        '/Count': 1,
        '/Kids': [ {
          '/Type': '/Page',
          '/MediaBox': [ 0, 0, 612, 792 ],
          '/Contents': [ {
            'stream': '1 0 0 1 72 708 cm BT /Helv 12 Tf (Hola Mundo!) Tj ET'
          } ],
          '/Resources': {
            '/Font': {
              '/Helv': {
                '/Type': '/Font',
                '/BaseFont': '/Helvetica',
                '/Subtype': '/Type1'
              }
            }
          },
        } ],
      }
    }
  }


const Signer = () => {

    const handlePdf = async ({ files }) => {

        const newPdf = new PDFAssembler(files[0]);
        await newPdf.assemblePdf('segunda_page.pdf')
            .then(pdfFile => fileSaver.saveAs(pdfFile, 'segunda_page.pdf'));
    }
    
    return (
        <div className="col-md-12 mt-5">
            <Form>
                <div className="col-md-5">
                    <input type="file" onChange={({ target }) => handlePdf(target)}/>
                </div>
            </Form>
        </div>
    )
}


export default Signer;