describe('NYSE tests', ()=>{
    let myData;
   //before 'Desc' block initializing and accessing the element selector data from fxiture file thrugh 'myData'
    before(()=>{
        cy.fixture('testdata').then((data)=>{
            myData=data
        })
    })

    //before 'Desc' block visiting the url and adjusting viewport size
    before(()=>{
        cy.visit(myData.url)
        cy.viewport(1024, 768)
    })

    it('On initial load the Directory must display data sorted by Symbol (ascending)',()=>{
        //Validating data sorted by symbol ascending
       let symbolsText = [];
        cy.get(myData.symbols).each(($e)=> {
            symbolsText.push($e.text().trim())
        })
        for(let i =0; i < symbolsText.length-1;i++){
            expect(symbolsText[i]).to.be.lessThan(symbolsText[i+1])
        }
    })

    it('Directory must display Symbol and Name for the corresponding company.',()=>{
        //validating both symbol and names are visible 
        cy.get('div.true-grid-8 > div.has-loader > table > tbody > tr > td').each(($e)=> {
            expect($e.text().trim().length).to.be.greaterThan(0)
            expect($e).to.be.visible
        })
     })

    it('Directory must display 10 records per page and provide a pager',()=>{
        //validting 10 records per page 
        let currentPage = 1;
        cy.get(myData.tableRow).should('have.length', 10)
        //Iterating through pager elements and validating the current page is disabled since user is on that page
        cy.get('div.true-grid-8 > div.text-center > div > ul > li').each(($e)=>{
            if($e.text().trim() === currentPage.toString()){
                expect($e).to.have.attr('class', 'disabled')
            }
        })
    })

    it('Directory pager must allow user to navigate to next page, previous page, first page, and last page.',()=>{
        let currentPage = 1;
        //validating "« FIRST‹ PREVIOUS 1" are disabled on page load
        cy.get(myData.first).should('have.attr', 'class', 'disabled')
        cy.get(myData.previous).should('have.attr', 'class', 'disabled')
        cy.get(myData.firstPage).should('have.attr', 'class', 'disabled')

        //validating: " last page(6) NEXT ›LAST » " " are enabled
        cy.get(myData.lastPage).should('have.attr', 'class', '')
        cy.get(myData.next).should('have.attr', 'class', '')
        cy.get(myData.last).should('have.attr', 'class', '')
        
        //user clicks 'next' 
        cy.get(myData.next).click()

        //current page is added by 1 since user clicked 'next'
        currentPage++;

    
        cy.get('div.true-grid-8 > div.text-center > div > ul > li').each(($e)=>{
            //validating the new current page is disabled
            if($e.text().trim() === currentPage.toString()){
                expect($e).to.have.attr('class', 'disabled')
            }
            //validating the previous page is now enabled
            if($e.text().trim() === (currentPage -1).toString()){
                expect($e).to.have.attr('class', '')
            }
        })

        //user clicks 'last'
        cy.get(myData.last).click()

        //validating "« FIRST‹ PREVIOUS 1" are now enabled since user clicked 'last'
        cy.get(myData.first).should('have.attr', 'class', '')
        cy.get(myData.previous).should('have.attr', 'class', '')
        cy.get(myData.firstPage).should('have.attr', 'class', '')

        //validating: " last page() NEXT ›LAST » " " are now disabled since user clicked 'last'
        cy.get(myData.next).should('have.attr', 'class', 'disabled')
        cy.get(myData.lastPage).should('have.attr', 'class', 'disabled')
        cy.get(myData.last).should('have.attr', 'class', 'disabled')

        //user clicks 'previous'
        cy.get(myData.previous).click()

        //validating: " last page() NEXT ›LAST » " " are now enabled since user clicked 'previous'
        cy.get(myData.lastPage).should('have.attr', 'class', '')
        cy.get(myData.next).should('have.attr', 'class', '')
        cy.get(myData.last).should('have.attr', 'class', '')

        //user clicks first
        cy.get(myData.first).click()

        //validating "« FIRST‹ PREVIOUS 1" are now disabled since user clicked 'first'
        cy.get(myData.first).should('have.attr', 'class', 'disabled')
        cy.get(myData.previous).should('have.attr', 'class', 'disabled')
        cy.get(myData.firstPage).should('have.attr', 'class', 'disabled')
     })

    //  it('api tests)',()=>{
    //     cy.request('POST', 'https://www.nyse.com/api/quotes/filter?instrumentType=EQUITY&pageNumber=1&sortColumn=NORMALIZED_TICKER&sortOrder=ASC&maxResultsPerPage=10&filterToken=AA').then((resonse)=>{
    //         expect(response).to.have.property('status', 200)
    //         expect(response).to.not.be.null
    //         })
        // I would loop through each object propery in the response array of objects and assert to see whether asc or descending for both symbols and name
    //     })
    //  })

     it('Filter results with less than 10 records',()=>{
         //filed by 'IBM'
         cy.get(myData.filter).type('IBM')
         cy.wait(1000)

         //vaidating records are atleast 1 or more
         cy.get(myData.tableRow).its('length').should('be.gte', 1)

         //since less than 10 records after filter validating all pagers are disabled
         cy.get(myData.fullPager).each(($e)=>{
                expect($e).to.have.attr('class', 'disabled')
         })
     })

     it('Filter results with more than 10 records',()=>{
        //clearing filter field
        cy.get(myData.filter).clear()
        //filtering by 'corp'
        cy.get(myData.filter).type('corp')
        cy.wait(1000)

        //validating records are 10 on the page
        cy.get(myData.tableRow).should('have.length', 10)
        
        //since we are coming from a state where all pagers were disabled, validating the expected pagers that should dislabled and enabled are behaving again as expected
        cy.get(myData.first).should('have.attr', 'class', 'disabled')
        cy.get(myData.previous).should('have.attr', 'class', 'disabled')
        cy.get(myData.firstPage).should('have.attr', 'class', 'disabled')

        cy.get(myData.next).should('have.attr', 'class', '')
        cy.get(myData.lastPage).should('have.attr', 'class', '')
        cy.get(myData.last).should('have.attr', 'class', '')
    })

    it('Filter results with no records',()=>{
        //clearing filter field
        cy.get(myData.filter).clear()
        //filtering by search that has now resutls
        cy.get(myData.filter).type('xxx')
        cy.wait(1000)
        //validating page shows the corrent message
        cy.get(myData.noResultsMessage).should('have.text', "Sorry, we couldn't find any instruments that match your criteria.")
        //validating pager does not render on the page when there are no resutls
        cy.get(myData.fullPager).should('not.be.visible')
    })
  })

  