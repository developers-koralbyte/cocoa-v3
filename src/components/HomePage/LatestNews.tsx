interface NewsItem {
  title: string;
  link: string;
  image: string;
  className?: string;
}

const LatestNews = () => {
  const newsItems: NewsItem[] = [
      {
          title: 'COCOA comes to Canada',
          link: 'https://www.linkedin.com/posts/cocoa-app_cocoaapp-fandb-launch-activity-7269807566384168960-wZPy/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD6dgWkBa-HpruozVXC_zTnxb65NVhmJAKg',
          image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&q=80&w=1200',
          className: 'col-span-2 row-span-2',
      },
      {
          title: 'COCOA among the TOP 10 Start-ups',
          link: 'https://www.linkedin.com/posts/cocoa-app_cocoa-koralbyte-landandexpandprogram-activity-7193844403247964160-qnKG/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD6dgWkBa-HpruozVXC_zTnxb65NVhmJAKg',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
          className: 'col-span-2',
      },
      {
          title: 'COCOA X Koralbyte',
          link: 'https://www.linkedin.com/posts/cocoa-app_koralbytetechnologies-tbdc-s2cohort-activity-7234428726178922497-JT9O/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD6dgWkBa-HpruozVXC_zTnxb65NVhmJAKg',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
      },
      {
          title: 'COCOA expands globally',
          link: 'https://www.linkedin.com/posts/koral-byte_financialservices-startupsupport-globalcompliance-activity-7311445081629020160-D0JL/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAD6dgWkBa-HpruozVXC_zTnxb65NVhmJAKg',
          image: 'https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?auto=format&fit=crop&q=80&w=800',
      },
  ]

  return (
      <section className="py-16 px-4 max-w-5xl mx-auto">
          <div className="mb-12">
              <h2 className="text-4xl font-nunito font-bold mb-2">
                  Our latest News!
              </h2>
              {/* <h3 className="text-3xl font-nunito font-bold">
                  Cocoa stays Press relevant
              </h3> */}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 auto-rows-[300px] px-2 md:px-4 lg:px-6">
              {newsItems.map((item, index) => (
                  <a
                      key={index}
                      href={item.link}
                      className={`group relative overflow-hidden rounded-3xl bg-gray-100 ${
                          item.className || ''
                      }`}
                  >
                      <div className="absolute inset-0">
                          <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 p-6">
                          <h3 className="text-xl font-semibold text-pink-200 font-nunito">
                              {item.title}
                          </h3>
                      </div>
                  </a>
              ))}
          </div>
      </section>
  )
};

export default LatestNews;
