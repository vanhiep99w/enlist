package com.enlist.be.config;

import com.enlist.be.entity.Paragraph;
import com.enlist.be.repository.ParagraphRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class ParagraphDataLoader implements CommandLineRunner {

    private final ParagraphRepository paragraphRepository;

    @Override
    public void run(String... args) {
        if (paragraphRepository.count() > 0) {
            log.info("Paragraphs already exist, skipping seed data");
            return;
        }

        log.info("Seeding paragraph data...");
        List<Paragraph> paragraphs = createSampleParagraphs();
        paragraphRepository.saveAll(paragraphs);
        log.info("Seeded {} paragraphs", paragraphs.size());
    }

    private List<Paragraph> createSampleParagraphs() {
        return List.of(
            // Daily Life - Easy
            Paragraph.builder()
                .title("Một ngày của tôi")
                .topic("daily_life")
                .difficulty("EASY")
                .content("Tôi thức dậy lúc sáu giờ sáng. Tôi đánh răng và rửa mặt. Sau đó tôi ăn sáng với gia đình. Mẹ tôi nấu phở rất ngon. Tôi đi học bằng xe đạp. Trường học cách nhà tôi hai cây số. Tôi học từ bảy giờ đến mười một giờ. Buổi trưa tôi ăn cơm ở căng tin. Buổi chiều tôi học thêm hai tiết nữa. Tôi về nhà lúc bốn giờ chiều. Tôi làm bài tập và giúp mẹ nấu cơm. Buổi tối cả gia đình ăn cơm cùng nhau. Sau đó tôi xem ti vi một chút. Tôi đi ngủ lúc mười giờ tối.")
                .build(),

            // Daily Life - Medium
            Paragraph.builder()
                .title("Cuối tuần của gia đình tôi")
                .topic("daily_life")
                .difficulty("MEDIUM")
                .content("Cuối tuần là thời gian quý báu để gia đình tôi sum họp. Thứ bảy buổi sáng, bố tôi thường đi chợ mua thực phẩm tươi ngon. Mẹ tôi chuẩn bị bữa sáng đặc biệt với bánh cuốn và cà phê. Sau bữa sáng, cả nhà cùng dọn dẹp nhà cửa. Buổi chiều chúng tôi hay đi công viên gần nhà để tập thể dục. Bố tôi thích chạy bộ còn tôi thì đạp xe đạp. Em gái tôi chơi cầu lông với mẹ. Tối thứ bảy, gia đình tôi thường đi ăn nhà hàng hoặc gọi đồ ăn về nhà. Chúng tôi vừa ăn vừa xem phim cùng nhau. Chủ nhật, ông bà nội thường đến thăm. Bà nấu những món ăn truyền thống mà cả nhà đều yêu thích. Buổi chiều chủ nhật, tôi thường dành thời gian để chuẩn bị cho tuần học mới.")
                .build(),

            // Travel - Easy
            Paragraph.builder()
                .title("Chuyến đi Đà Lạt")
                .topic("travel")
                .difficulty("EASY")
                .content("Tháng trước tôi đi Đà Lạt. Đà Lạt là thành phố rất đẹp. Thời tiết ở đây mát mẻ quanh năm. Tôi ở khách sạn gần hồ Xuân Hương. Buổi sáng tôi đi dạo quanh hồ. Tôi thấy nhiều hoa đẹp. Tôi đến thăm vườn hoa thành phố. Có rất nhiều loại hoa ở đây. Tôi chụp nhiều ảnh làm kỷ niệm. Buổi chiều tôi uống cà phê. Cà phê Đà Lạt rất ngon và thơm. Tôi mua nhiều quà cho gia đình. Tôi mua mứt dâu và atiso. Chuyến đi rất vui và đáng nhớ.")
                .build(),

            // Travel - Medium
            Paragraph.builder()
                .title("Khám phá Hội An")
                .topic("travel")
                .difficulty("MEDIUM")
                .content("Hội An là một trong những điểm du lịch hấp dẫn nhất Việt Nam. Thành phố cổ này được UNESCO công nhận là di sản văn hóa thế giới. Khi đến Hội An, du khách sẽ bị cuốn hút bởi những ngôi nhà cổ và đèn lồng rực rỡ. Phố cổ đẹp nhất vào buổi tối khi đèn lồng được thắp sáng. Tôi đã đi thuyền trên sông Hoài để ngắm cảnh. Tôi cũng ghé thăm chùa Cầu, một biểu tượng của Hội An. Đồ ăn ở đây rất ngon, đặc biệt là cao lầu và mì Quảng. Tôi đã may một bộ áo dài ở tiệm may nổi tiếng. Buổi sáng, tôi đạp xe ra biển An Bàng để tắm biển. Bãi biển ở đây sạch và yên tĩnh. Tôi đã mua nhiều đồ thủ công mỹ nghệ làm quà lưu niệm. Hội An để lại trong tôi nhiều kỷ niệm đẹp.")
                .build(),

            // Business - Medium
            Paragraph.builder()
                .title("Cuộc họp công ty")
                .topic("business")
                .difficulty("MEDIUM")
                .content("Sáng nay công ty tôi có cuộc họp quan trọng. Giám đốc thông báo về kế hoạch kinh doanh quý tới. Doanh số bán hàng tháng trước tăng mười lăm phần trăm. Đây là tin vui cho toàn bộ nhân viên. Phòng marketing trình bày chiến lược quảng cáo mới. Họ sẽ tập trung vào mạng xã hội và quảng cáo trực tuyến. Phòng nhân sự thông báo sẽ tuyển thêm năm nhân viên. Công ty cũng sẽ tổ chức khóa đào tạo cho nhân viên mới. Cuối cuộc họp, giám đốc cảm ơn mọi người đã nỗ lực làm việc. Công ty sẽ tổ chức tiệc cuối năm để ghi nhận đóng góp của nhân viên. Mọi người rất vui và hứng khởi sau cuộc họp. Tôi quay về bàn làm việc và bắt đầu nhiệm vụ mới.")
                .build(),

            // Business - Hard
            Paragraph.builder()
                .title("Đàm phán hợp đồng")
                .topic("business")
                .difficulty("HARD")
                .content("Hôm qua tôi tham gia buổi đàm phán hợp đồng với đối tác nước ngoài. Đây là cơ hội quan trọng để mở rộng thị trường xuất khẩu. Đối tác đến từ Nhật Bản và họ rất chuyên nghiệp. Chúng tôi thảo luận về điều khoản thanh toán và thời hạn giao hàng. Họ yêu cầu giảm giá mười phần trăm cho đơn hàng lớn. Sau khi cân nhắc kỹ lưỡng, chúng tôi đồng ý giảm bảy phần trăm. Về phương thức thanh toán, hai bên thống nhất dùng thư tín dụng. Điều này đảm bảo an toàn cho cả hai bên. Chúng tôi cũng thỏa thuận về tiêu chuẩn chất lượng sản phẩm. Đối tác yêu cầu chứng nhận ISO và kiểm tra chất lượng định kỳ. Công ty chúng tôi cam kết đáp ứng tất cả yêu cầu. Cuối buổi đàm phán, hai bên ký biên bản ghi nhớ. Hợp đồng chính thức sẽ được ký vào tuần sau. Đây là bước tiến quan trọng cho sự phát triển của công ty.")
                .build(),

            // Education - Easy
            Paragraph.builder()
                .title("Lớp học tiếng Anh")
                .topic("education")
                .difficulty("EASY")
                .content("Tôi học tiếng Anh ở trung tâm ngoại ngữ. Lớp học bắt đầu lúc bảy giờ tối. Cô giáo của tôi rất vui tính và dễ thương. Cô ấy là người Mỹ. Cô ấy nói tiếng Việt rất giỏi. Trong lớp có mười hai học viên. Chúng tôi học nghe, nói, đọc và viết. Hôm nay chúng tôi học về thời tiết. Tôi học được nhiều từ vựng mới. Cô giáo cho chúng tôi chơi trò chơi. Trò chơi giúp chúng tôi nhớ từ vựng tốt hơn. Cuối buổi học, cô giáo giao bài tập về nhà. Tôi rất thích học tiếng Anh.")
                .build(),

            // Education - Medium
            Paragraph.builder()
                .title("Kỳ thi đại học")
                .topic("education")
                .difficulty("MEDIUM")
                .content("Năm ngoái tôi thi đại học. Đây là kỳ thi quan trọng nhất trong cuộc đời học sinh. Tôi đã chuẩn bị suốt ba năm cấp ba cho kỳ thi này. Tôi học thêm ở trung tâm luyện thi mỗi ngày. Bố mẹ tôi luôn động viên và hỗ trợ tôi. Ngày thi, tôi dậy từ năm giờ sáng. Mẹ nấu bữa sáng đặc biệt để tôi có sức khỏe tốt. Bố chở tôi đến điểm thi. Tôi thi ba môn: toán, lý và hóa. Mỗi môn thi kéo dài chín mươi phút. Tôi làm bài cẩn thận và kiểm tra lại nhiều lần. Sau kỳ thi, tôi cảm thấy nhẹ nhõm. Một tháng sau, kết quả được công bố. Tôi đạt điểm cao và đỗ vào trường đại học mơ ước. Đó là ngày hạnh phúc nhất của tôi và gia đình.")
                .build(),

            // Education - Hard
            Paragraph.builder()
                .title("Nghiên cứu khoa học")
                .topic("education")
                .difficulty("HARD")
                .content("Tôi đang thực hiện đề tài nghiên cứu khoa học về trí tuệ nhân tạo. Đây là lĩnh vực đang phát triển nhanh chóng trên toàn thế giới. Mục tiêu nghiên cứu của tôi là ứng dụng học máy trong y tế. Cụ thể, tôi xây dựng mô hình để phát hiện sớm bệnh ung thư. Tôi thu thập dữ liệu từ các bệnh viện lớn trong thành phố. Việc xử lý và phân tích dữ liệu mất rất nhiều thời gian. Tôi sử dụng các thuật toán học sâu để huấn luyện mô hình. Kết quả ban đầu cho thấy độ chính xác đạt chín mươi hai phần trăm. Tuy nhiên, tôi vẫn cần cải thiện để đạt kết quả tốt hơn. Giáo sư hướng dẫn của tôi rất tận tâm và giàu kinh nghiệm. Thầy đã giúp tôi giải quyết nhiều vấn đề khó khăn. Tôi dự định sẽ công bố kết quả nghiên cứu tại hội nghị quốc tế. Đây sẽ là đóng góp nhỏ của tôi cho sự phát triển của khoa học.")
                .build(),

            // Daily Life - Hard
            Paragraph.builder()
                .title("Cuộc sống ở thành phố lớn")
                .topic("daily_life")
                .difficulty("HARD")
                .content("Cuộc sống ở thành phố Hồ Chí Minh có nhiều thuận lợi nhưng cũng không ít thử thách. Tôi chuyển đến đây làm việc được ba năm rồi. Ban đầu, tôi gặp nhiều khó khăn trong việc thích nghi với nhịp sống nhanh. Giao thông giờ cao điểm luôn là vấn đề đau đầu. Tôi phải dậy sớm để tránh kẹt xe khi đi làm. Chi phí sinh hoạt ở đây khá cao so với quê nhà. Tiền thuê nhà chiếm gần một phần ba lương tháng của tôi. Tuy nhiên, thành phố cũng mang đến nhiều cơ hội phát triển. Tôi có thể tham gia các khóa học nâng cao kỹ năng. Có nhiều sự kiện văn hóa và giải trí diễn ra hàng tuần. Tôi đã kết bạn với nhiều người từ khắp các tỉnh thành. Cuối tuần, tôi thường khám phá các quán cà phê và nhà hàng mới. Đôi khi tôi nhớ nhà và muốn về thăm gia đình. Nhưng tôi biết rằng mình cần nỗ lực để xây dựng tương lai. Thành phố này đã dạy tôi nhiều bài học quý giá về cuộc sống.")
                .build()
        );
    }
}
